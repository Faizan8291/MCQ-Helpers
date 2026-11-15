package com.mcqbuilder.api.question;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.mcqbuilder.api.question.dto.MetadataRequest;
import com.mcqbuilder.api.question.dto.OptionRequest;
import com.mcqbuilder.api.question.dto.QuestionRequest;

class QuestionRulesTest {

	private static QuestionRequest request(List<OptionRequest> options, String correctOptionId) {
		return new QuestionRequest(
				"Which unit measures force?",
				options,
				correctOptionId,
				"",
				Difficulty.EASY,
				new MetadataRequest("SSC CGL", "Physics", "Units", "SI Units"));
	}

	private static final List<OptionRequest> OPTIONS = List.of(
			new OptionRequest("a", "Joule"),
			new OptionRequest("b", "Newton"),
			new OptionRequest("c", "Watt"),
			new OptionRequest("d", "Pascal"));

	@Test
	void acceptsWellFormedRequest() {
		assertThat(QuestionRules.check(request(OPTIONS, "b"))).isEmpty();
	}

	@Test
	void rejectsDuplicateOptionsIgnoringCaseAndSpacing() {
		List<OptionRequest> duplicated = List.of(
				new OptionRequest("a", "Newton"),
				new OptionRequest("b", "  newton "),
				new OptionRequest("c", "Watt"),
				new OptionRequest("d", "Pascal"));

		Map<String, String> errors = QuestionRules.check(request(duplicated, "a"));

		assertThat(errors).containsOnlyKeys("options");
		assertThat(errors.get("options")).isEqualTo("Option B duplicates Option A. Options must be different.");
	}

	@Test
	void rejectsCorrectAnswerThatIsNotOneOfTheOptions() {
		Map<String, String> errors = QuestionRules.check(request(OPTIONS, "z"));

		assertThat(errors).containsOnlyKeys("correctOptionId");
		assertThat(errors.get("correctOptionId"))
				.isEqualTo("The selected correct answer does not match any option.");
	}

	@Test
	void rejectsWrongOptionCount() {
		Map<String, String> errors = QuestionRules.check(request(OPTIONS.subList(0, 3), "a"));

		assertThat(errors).containsOnlyKeys("options");
		assertThat(errors.get("options")).isEqualTo("Exactly 4 options are required.");
	}

	@Test
	void rejectsOptionsSharingAnId() {
		List<OptionRequest> sharedIds = List.of(
				new OptionRequest("dup", "Joule"),
				new OptionRequest("dup", "Newton"),
				new OptionRequest("c", "Watt"),
				new OptionRequest("d", "Pascal"));

		Map<String, String> errors = QuestionRules.check(request(sharedIds, "dup"));

		assertThat(errors).containsOnlyKeys("options");
		assertThat(errors.get("options")).isEqualTo("Each option must have a unique id.");
	}

	@Test
	void reportsFirstEmptyOptionWithItsLetter() {
		List<OptionRequest> withEmpty = List.of(
				new OptionRequest("a", "Joule"),
				new OptionRequest("b", "   "),
				new OptionRequest("c", "Watt"),
				new OptionRequest("d", "Pascal"));

		Map<String, String> errors = QuestionRules.check(request(withEmpty, "a"));

		assertThat(errors.get("options")).isEqualTo("Option B cannot be empty.");
	}
}
