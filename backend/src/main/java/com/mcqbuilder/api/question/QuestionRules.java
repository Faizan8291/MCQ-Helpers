package com.mcqbuilder.api.question;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.mcqbuilder.api.question.dto.OptionRequest;
import com.mcqbuilder.api.question.dto.QuestionRequest;

/**
 * The rules Bean Validation cannot express, ported one-for-one from the
 * frontend's validation.ts. Keeping them server-side is not redundant: the
 * browser can be bypassed, and Milestone 4's AI-generated questions will reach
 * this API without ever touching the form.
 */
public final class QuestionRules {

	public static final int OPTION_COUNT = 4;

	private QuestionRules() {
	}

	/** Collapses whitespace and lowercases so "Newton " equals "newton". */
	public static String normalizeForComparison(String text) {
		return text.trim().replaceAll("\\s+", " ").toLowerCase();
	}

	/**
	 * @return field name -> message, empty when the request is acceptable.
	 *         Field names match the frontend's ValidationField keys.
	 */
	public static Map<String, String> check(QuestionRequest request) {
		Map<String, String> errors = new LinkedHashMap<>();
		List<OptionRequest> options = request.options();
		if (options == null) {
			errors.put("options", "Exactly " + OPTION_COUNT + " options are required.");
			return errors;
		}
		if (options.size() != OPTION_COUNT) {
			errors.put("options", "Exactly " + OPTION_COUNT + " options are required.");
		}
		else {
			checkOptions(options, errors);
		}

		String correctOptionId = request.correctOptionId();
		if (correctOptionId != null && !correctOptionId.isBlank()) {
			boolean matchesAnOption = options.stream()
					.anyMatch(option -> correctOptionId.trim().equals(trimToNull(option.id())));
			if (!matchesAnOption) {
				errors.put("correctOptionId", "The selected correct answer does not match any option.");
			}
		}
		return errors;
	}

	private static void checkOptions(List<OptionRequest> options, Map<String, String> errors) {
		Map<String, String> firstUseByText = new HashMap<>();
		Set<String> seenIds = new HashSet<>();
		Set<String> duplicateIds = new HashSet<>();
		String firstError = null;

		for (int index = 0; index < options.size(); index++) {
			OptionRequest option = options.get(index);
			String label = optionLabel(index);
			String id = trimToNull(option.id());
			if (id != null && !seenIds.add(id)) {
				duplicateIds.add(id);
			}
			if (firstError != null) {
				continue; // keep the first option error only, like the UI does
			}
			String text = option.text() == null ? "" : option.text().trim();
			if (text.isEmpty()) {
				firstError = label + " cannot be empty.";
				continue;
			}
			String duplicateOf = firstUseByText.putIfAbsent(normalizeForComparison(text), label);
			if (duplicateOf != null) {
				firstError = label + " duplicates " + duplicateOf + ". Options must be different.";
			}
		}

		if (firstError != null) {
			errors.put("options", firstError);
		}
		else if (!duplicateIds.isEmpty()) {
			errors.put("options", "Each option must have a unique id.");
		}
	}

	private static String optionLabel(int index) {
		return "Option " + (char) ('A' + index);
	}

	private static String trimToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
