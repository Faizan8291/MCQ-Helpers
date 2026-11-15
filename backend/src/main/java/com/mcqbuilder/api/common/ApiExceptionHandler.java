package com.mcqbuilder.api.common;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Every error leaves the API as RFC 9457 "application/problem+json" with an
 * extra fieldErrors map, so the frontend can highlight the same fields the
 * browser-side validator would have flagged.
 */
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ProblemDetail handleNotFound(ResourceNotFoundException exception) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
		problem.setTitle("Not found");
		return problem;
	}

	@ExceptionHandler(FieldValidationException.class)
	public ProblemDetail handleFieldValidation(FieldValidationException exception) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
		problem.setTitle("Validation failed");
		problem.setProperty("fieldErrors", exception.getFieldErrors());
		return problem;
	}

	/** MySQL constraint violations surface as a conflict, never as a 500. */
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ProblemDetail handleDataIntegrity(DataIntegrityViolationException exception) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
				"The question could not be saved because it conflicts with existing data.");
		problem.setTitle("Conflict");
		return problem;
	}

	@Override
	protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException exception,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		Map<String, String> fieldErrors = new LinkedHashMap<>();
		exception.getBindingResult().getFieldErrors().forEach(error -> {
			String field = normalizeField(error.getField());
			String message = error.getDefaultMessage() == null ? "Invalid value." : error.getDefaultMessage();
			// One message per field keeps the payload as small as the UI's needs.
			fieldErrors.putIfAbsent(field, message);
		});

		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed.");
		problem.setTitle("Validation failed");
		problem.setProperty("fieldErrors", fieldErrors);
		return handleExceptionInternal(exception, problem, headers, HttpStatus.BAD_REQUEST, request);
	}

	@Override
	protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException exception,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		String detail = "The request body is malformed or contains an unsupported value.";
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
		problem.setTitle("Bad request");
		return handleExceptionInternal(exception, problem, headers, HttpStatus.BAD_REQUEST, request);
	}

	/**
	 * Bean Validation reports nested paths such as "options[2].text" or
	 * "metadata.exam"; the frontend's error map is keyed by "options" and "exam".
	 */
	static String normalizeField(String field) {
		String normalized = field.startsWith("options") ? "options" : field;
		if (normalized.startsWith("metadata.")) {
			normalized = normalized.substring("metadata.".length());
		}
		return normalized;
	}
}
