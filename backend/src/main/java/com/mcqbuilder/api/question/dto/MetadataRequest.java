package com.mcqbuilder.api.question.dto;

import jakarta.validation.constraints.Size;

/** All four classification fields are optional, but each is length-limited. */
public record MetadataRequest(
		@Size(max = 100, message = "Exam must be 100 characters or fewer.") String exam,
		@Size(max = 100, message = "Subject must be 100 characters or fewer.") String subject,
		@Size(max = 100, message = "Chapter must be 100 characters or fewer.") String chapter,
		@Size(max = 100, message = "Topic must be 100 characters or fewer.") String topic) {

	public static MetadataRequest empty() {
		return new MetadataRequest(null, null, null, null);
	}
}
