package com.mcqbuilder.api.question.dto;

import java.util.List;

import com.mcqbuilder.api.question.Difficulty;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for create and update. Field constraints mirror the frontend's
 * validation.ts limits exactly; cross-field rules (distinct options, correct
 * answer must be one of them) live in QuestionRules because Bean Validation
 * cannot express them and we want identical messages on both tiers.
 */
public record QuestionRequest(
		@NotBlank(message = "Question text is required.")
		@Size(max = 1000, message = "Question text must be 1000 characters or fewer.")
		String questionText,

		@NotNull(message = "Exactly 4 options are required.")
		@Size(min = 4, max = 4, message = "Exactly 4 options are required.")
		@Valid
		List<OptionRequest> options,

		@NotBlank(message = "Select the correct answer.")
		String correctOptionId,

		@Size(max = 2000, message = "Explanation must be 2000 characters or fewer.")
		String explanation,

		@NotNull(message = "Choose a difficulty.")
		Difficulty difficulty,

		@Valid
		@NotNull(message = "Metadata is required.")
		MetadataRequest metadata) {

	public MetadataRequest metadataOrEmpty() {
		return metadata == null ? MetadataRequest.empty() : metadata;
	}
}
