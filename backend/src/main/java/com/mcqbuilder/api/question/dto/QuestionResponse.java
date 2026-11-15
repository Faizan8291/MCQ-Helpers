package com.mcqbuilder.api.question.dto;

import java.time.Instant;
import java.util.List;

import com.mcqbuilder.api.question.Difficulty;
import com.mcqbuilder.api.question.SourceType;

/**
 * Wire shape of a stored question. Field names match the frontend's Question
 * interface exactly, so swapping the mock repository for an HTTP one is a
 * one-file change in a later milestone.
 *
 * Timestamps are ISO-8601 instants ("2026-11-01T14:25:00Z"), the same format
 * Date.prototype.toISOString() produces.
 */
public record QuestionResponse(
		String id,
		String questionText,
		List<OptionResponse> options,
		String correctOptionId,
		String explanation,
		Difficulty difficulty,
		SourceType sourceType,
		MetadataResponse metadata,
		Instant createdAt,
		Instant updatedAt) {

	public record OptionResponse(String id, String text) {
	}

	public record MetadataResponse(String exam, String subject, String chapter, String topic) {
	}
}
