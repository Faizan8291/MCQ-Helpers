package com.mcqbuilder.api.question.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @param id optional client-supplied id; when blank the server mints one. The
 *           frontend sends the ids it already holds so the correctOptionId it
 *           submits keeps pointing at the same choice.
 */
public record OptionRequest(
		@Size(max = 36, message = "Option id must be 36 characters or fewer.") String id,
		@NotBlank(message = "Option text is required.")
		@Size(max = 500, message = "Option must be 500 characters or fewer.") String text) {
}
