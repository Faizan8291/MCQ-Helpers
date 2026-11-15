package com.mcqbuilder.api.question;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mcqbuilder.api.common.FieldValidationException;
import com.mcqbuilder.api.common.ResourceNotFoundException;
import com.mcqbuilder.api.question.dto.OptionRequest;
import com.mcqbuilder.api.question.dto.QuestionRequest;
import com.mcqbuilder.api.question.dto.QuestionResponse;

/**
 * All write rules live here: validate, normalize, then persist. Read methods
 * return mapped DTOs while the entity is still inside the transaction, so lazy
 * option collections never leak into the web layer.
 */
@Service
public class QuestionService {

	private final QuestionRepository repository;

	public QuestionService(QuestionRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public List<QuestionResponse> list() {
		return repository.findAllByOrderByUpdatedAtDesc().stream()
				.map(QuestionMapper::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public QuestionResponse get(String id) {
		return QuestionMapper.toResponse(find(id));
	}

	@Transactional
	public QuestionResponse create(QuestionRequest request) {
		validate(request);
		Instant now = Instant.now();
		QuestionEntity entity = new QuestionEntity(UUID.randomUUID().toString(), now);
		entity.setSourceType(SourceType.MANUAL);
		apply(entity, request, now);
		addOptions(entity, request.options());
		return QuestionMapper.toResponse(repository.save(entity));
	}

	@Transactional
	public QuestionResponse update(String id, QuestionRequest request) {
		validate(request);
		QuestionEntity entity = find(id);
		apply(entity, request, Instant.now());

		// Replace the option rows wholesale. The flush is required: the client
		// reuses its option ids, so the INSERTs must not run before the DELETEs
		// (primary-key and (question_id, display_order) uniqueness both bite).
		entity.clearOptions();
		repository.flush();
		addOptions(entity, request.options());

		return QuestionMapper.toResponse(repository.save(entity));
	}

	@Transactional
	public void delete(String id) {
		QuestionEntity entity = find(id);
		repository.delete(entity);
	}

	private QuestionEntity find(String id) {
		return repository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Question " + id + " not found."));
	}

	private void validate(QuestionRequest request) {
		Map<String, String> errors = QuestionRules.check(request);
		if (!errors.isEmpty()) {
			throw new FieldValidationException(errors);
		}
	}

	private void addOptions(QuestionEntity entity, List<OptionRequest> options) {
		List<OptionRequest> safeOptions = options == null ? List.of() : options;
		int order = 0;
		for (OptionRequest option : safeOptions) {
			String optionId = trimToNull(option.id());
			String id = optionId == null ? UUID.randomUUID().toString() : optionId;
			entity.addOption(new QuestionOptionEntity(id, order++, trim(option.text())));
		}
	}

	/** Copies normalized request values onto the entity (identity fields excepted). */
	private void apply(QuestionEntity entity, QuestionRequest request, Instant now) {
		var metadata = request.metadataOrEmpty();
		entity.setQuestionText(trim(request.questionText()));
		entity.setCorrectOptionId(trimToEmpty(request.correctOptionId()));
		entity.setExplanation(trimToEmpty(request.explanation()));
		entity.setDifficulty(request.difficulty());
		entity.setExam(trimToEmpty(metadata.exam()));
		entity.setSubject(trimToEmpty(metadata.subject()));
		entity.setChapter(trimToEmpty(metadata.chapter()));
		entity.setTopic(trimToEmpty(metadata.topic()));
		entity.touch(now);
	}

	private static String trim(String value) {
		return value == null ? "" : value.trim();
	}

	private static String trimToEmpty(String value) {
		return trim(value);
	}

	private static String trimToNull(String value) {
		String trimmed = trim(value);
		return trimmed.isEmpty() ? null : trimmed;
	}
}
