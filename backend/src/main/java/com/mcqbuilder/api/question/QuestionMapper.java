package com.mcqbuilder.api.question;

import com.mcqbuilder.api.question.dto.QuestionResponse;

/** Entity -> wire DTO. The only place that knows both shapes. */
final class QuestionMapper {

	private QuestionMapper() {
	}

	static QuestionResponse toResponse(QuestionEntity entity) {
		return new QuestionResponse(
				entity.getId(),
				entity.getQuestionText(),
				entity.getOptions().stream()
						.map(option -> new QuestionResponse.OptionResponse(option.getId(), option.getText()))
						.toList(),
				entity.getCorrectOptionId(),
				entity.getExplanation(),
				entity.getDifficulty(),
				entity.getSourceType(),
				new QuestionResponse.MetadataResponse(
						entity.getExam(),
						entity.getSubject(),
						entity.getChapter(),
						entity.getTopic()),
				entity.getCreatedAt(),
				entity.getUpdatedAt());
	}
}
