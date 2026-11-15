package com.mcqbuilder.api.question;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * End-to-end over HTTP against the real MySQL schema (Flyway-migrated), so the
 * tests prove the JPA mappings match the migration instead of mocking them.
 * Each test rolls back.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class QuestionApiTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private static Map<String, Object> option(String id, String text) {
		Map<String, Object> option = new LinkedHashMap<>();
		option.put("id", id);
		option.put("text", text);
		return option;
	}

	private static Map<String, Object> payload(String questionText, List<String> optionTexts, int correctIndex) {
		List<String> ids = List.of("opt-a", "opt-b", "opt-c", "opt-d");
		List<Map<String, Object>> options = new ArrayList<>();
		for (int i = 0; i < optionTexts.size(); i++) {
			options.add(option(ids.get(i), optionTexts.get(i)));
		}
		Map<String, Object> metadata = new LinkedHashMap<>();
		metadata.put("exam", "SSC CGL");
		metadata.put("subject", "Physics");
		metadata.put("chapter", "Units and Measurements");
		metadata.put("topic", "SI Units");

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("questionText", questionText);
		body.put("options", options);
		body.put("correctOptionId", ids.get(correctIndex));
		body.put("explanation", "Because it is defined that way.");
		body.put("difficulty", "EASY");
		body.put("metadata", metadata);
		return body;
	}

	private JsonNode create(String questionText) throws Exception {
		String body = mockMvc.perform(post("/api/questions")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								payload(questionText, List.of("Joule", "Newton", "Watt", "Pascal"), 1))))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
		return objectMapper.readTree(body);
	}

	@Test
	void createsAQuestionAndEchoesTheContract() throws Exception {
		String json = mockMvc.perform(post("/api/questions")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								payload("Which unit measures force?", List.of("Joule", "Newton", "Watt", "Pascal"), 1))))
				.andExpect(status().isCreated())
				.andExpect(header().exists("Location"))
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.id").isNotEmpty())
				.andExpect(jsonPath("$.questionText").value("Which unit measures force?"))
				.andExpect(jsonPath("$.options.length()").value(4))
				.andExpect(jsonPath("$.options[1].id").value("opt-b"))
				.andExpect(jsonPath("$.options[1].text").value("Newton"))
				.andExpect(jsonPath("$.correctOptionId").value("opt-b"))
				.andExpect(jsonPath("$.difficulty").value("EASY"))
				.andExpect(jsonPath("$.sourceType").value("MANUAL"))
				.andExpect(jsonPath("$.metadata.exam").value("SSC CGL"))
				.andExpect(jsonPath("$.createdAt").isNotEmpty())
				.andExpect(jsonPath("$.updatedAt").isNotEmpty())
				.andReturn().getResponse().getContentAsString();

		// ISO-8601 instant, the same string format the frontend produces.
		JsonNode created = objectMapper.readTree(json);
		assertThat(created.get("createdAt").asText()).endsWith("Z");
		String id = created.get("id").asText();
		mockMvc.perform(get("/api/questions/{id}", id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(id));
	}

	@Test
	void listsQuestionsNewestFirst() throws Exception {
		String first = create("First question?").get("id").asText();
		String second = create("Second question?").get("id").asText();

		mockMvc.perform(get("/api/questions"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].id").value(second))
				.andExpect(jsonPath("$[1].id").value(first));
	}

	@Test
	void rejectsDuplicateOptionsWithAFieldError() throws Exception {
		mockMvc.perform(post("/api/questions")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								payload("Duplicated?", List.of("Newton", "newton", "Watt", "Pascal"), 0))))
				.andExpect(status().isBadRequest())
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
				.andExpect(jsonPath("$.title").value("Validation failed"))
				.andExpect(jsonPath("$.fieldErrors.options")
						.value("Option B duplicates Option A. Options must be different."));
	}

	@Test
	void rejectsBlankQuestionText() throws Exception {
		mockMvc.perform(post("/api/questions")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								payload("   ", List.of("Joule", "Newton", "Watt", "Pascal"), 1))))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.questionText").value("Question text is required."));
	}

	@Test
	void rejectsWrongOptionCount() throws Exception {
		mockMvc.perform(post("/api/questions")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								payload("Three only?", List.of("Joule", "Newton", "Watt"), 1))))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.options").value("Exactly 4 options are required."));
	}

	@Test
	void rejectsUnknownDifficulty() throws Exception {
		Map<String, Object> body = payload("Bad difficulty?", List.of("Joule", "Newton", "Watt", "Pascal"), 1);
		body.put("difficulty", "IMPOSSIBLE");

		mockMvc.perform(post("/api/questions")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(body)))
				.andExpect(status().isBadRequest())
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON));
	}

	@Test
	void updatesInPlaceReorderingOptionsWithoutLosingTheAnswer() throws Exception {
		String id = create("Which unit measures force?").get("id").asText();

		// Same option ids, reversed order: correctOptionId must still point at Newton.
		Map<String, Object> body = payload("Which unit measures force (edited)?",
				List.of("Pascal", "Watt", "Newton", "Joule"), 0);
		body.put("options", List.of(
				option("opt-d", "Pascal"),
				option("opt-c", "Watt"),
				option("opt-b", "Newton"),
				option("opt-a", "Joule")));
		body.put("correctOptionId", "opt-b");

		mockMvc.perform(put("/api/questions/{id}", id)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(body)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(id))
				.andExpect(jsonPath("$.questionText").value("Which unit measures force (edited)?"))
				.andExpect(jsonPath("$.options[0].id").value("opt-d"))
				.andExpect(jsonPath("$.options[2].id").value("opt-b"))
				.andExpect(jsonPath("$.options[2].text").value("Newton"))
				.andExpect(jsonPath("$.correctOptionId").value("opt-b"));

		mockMvc.perform(get("/api/questions/{id}", id))
				.andExpect(jsonPath("$.options[2].id").value("opt-b"));
	}

	@Test
	void returns404ForUnknownQuestion() throws Exception {
		mockMvc.perform(get("/api/questions/does-not-exist"))
				.andExpect(status().isNotFound())
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
				.andExpect(jsonPath("$.title").value("Not found"));

		mockMvc.perform(put("/api/questions/does-not-exist")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								payload("Ghost?", List.of("Joule", "Newton", "Watt", "Pascal"), 1))))
				.andExpect(status().isNotFound());

		mockMvc.perform(delete("/api/questions/does-not-exist"))
				.andExpect(status().isNotFound());
	}

	@Test
	void deletesAQuestion() throws Exception {
		String id = create("Temporary question?").get("id").asText();

		mockMvc.perform(delete("/api/questions/{id}", id))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/questions/{id}", id))
				.andExpect(status().isNotFound());
	}

	@Test
	void rejectsMalformedBody() throws Exception {
		mockMvc.perform(post("/api/questions")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"questionText\":"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.title").value("Bad request"));
	}

	@Test
	void rejectsOptionTextOverTheLimit() throws Exception {
		Map<String, Object> body = payload("Too long?",
				List.of("Joule", "x".repeat(501), "Watt", "Pascal"), 1);

		mockMvc.perform(post("/api/questions")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(body)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.options").value("Option must be 500 characters or fewer."));
	}

	@Test
	void persistsSourceTypeAsManualForTeacherAuthoredQuestions() throws Exception {
		JsonNode created = create("Manual question?");
		assertThat(created.get("sourceType").asText()).isEqualTo("MANUAL");
	}

	@Test
	void trimsWhitespaceBeforeStoring() throws Exception {
		Map<String, Object> body = payload("  Padded question?  ",
				List.of("  Joule  ", "Newton", "Watt", "Pascal"), 1);

		String json = mockMvc.perform(post("/api/questions")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(body)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.questionText").value("Padded question?"))
				.andExpect(jsonPath("$.options[0].text").value("Joule"))
				.andReturn().getResponse().getContentAsString();

		assertThat(objectMapper.readTree(json).get("options").size()).isEqualTo(4);
	}
}
