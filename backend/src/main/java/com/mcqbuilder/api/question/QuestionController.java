package com.mcqbuilder.api.question;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mcqbuilder.api.question.dto.QuestionRequest;
import com.mcqbuilder.api.question.dto.QuestionResponse;

import jakarta.validation.Valid;

/**
 * REST surface for the question bank, mirroring the frontend's
 * QuestionRepository interface (list / get / create / update / remove).
 */
@RestController
@RequestMapping("/api/questions")
public class QuestionController {

	private final QuestionService service;

	public QuestionController(QuestionService service) {
		this.service = service;
	}

	@GetMapping
	public List<QuestionResponse> list() {
		return service.list();
	}

	@GetMapping("/{id}")
	public QuestionResponse get(@PathVariable String id) {
		return service.get(id);
	}

	@PostMapping
	public ResponseEntity<QuestionResponse> create(@Valid @RequestBody QuestionRequest request) {
		QuestionResponse created = service.create(request);
		return ResponseEntity.created(URI.create("/api/questions/" + created.id())).body(created);
	}

	@PutMapping("/{id}")
	public QuestionResponse update(@PathVariable String id, @Valid @RequestBody QuestionRequest request) {
		return service.update(id, request);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}
}
