package com.mcqbuilder.api.common;

import java.util.Map;

/**
 * Business-rule failure with per-field messages. Mapped to HTTP 400 with the
 * same {field: message} shape the frontend already renders.
 */
public class FieldValidationException extends RuntimeException {

	private final Map<String, String> fieldErrors;

	public FieldValidationException(Map<String, String> fieldErrors) {
		super("Validation failed.");
		this.fieldErrors = Map.copyOf(fieldErrors);
	}

	public Map<String, String> getFieldErrors() {
		return fieldErrors;
	}
}
