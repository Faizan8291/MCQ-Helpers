package com.mcqbuilder.api.question;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

@Entity
@Table(name = "question")
public class QuestionEntity {

	@Id
	@Column(name = "id", length = 36, nullable = false, updatable = false)
	private String id;

	@Column(name = "question_text", length = 1000, nullable = false)
	private String questionText;

	@Column(name = "correct_option_id", length = 36, nullable = false)
	private String correctOptionId;

	@Column(name = "explanation", length = 2000, nullable = false)
	private String explanation = "";

	@Enumerated(EnumType.STRING)
	@Column(name = "difficulty", length = 10, nullable = false)
	private Difficulty difficulty;

	@Enumerated(EnumType.STRING)
	@Column(name = "source_type", length = 10, nullable = false)
	private SourceType sourceType;

	@Column(name = "exam", length = 100, nullable = false)
	private String exam = "";

	@Column(name = "subject", length = 100, nullable = false)
	private String subject = "";

	@Column(name = "chapter", length = 100, nullable = false)
	private String chapter = "";

	@Column(name = "topic", length = 100, nullable = false)
	private String topic = "";

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("displayOrder ASC")
	private List<QuestionOptionEntity> options = new ArrayList<>();

	protected QuestionEntity() {
		// for JPA
	}

	public QuestionEntity(String id, Instant createdAt) {
		this.id = id;
		this.createdAt = createdAt;
		this.updatedAt = createdAt;
	}

	/** Keeps both sides of the association in sync; Hibernate needs that. */
	public void addOption(QuestionOptionEntity option) {
		option.attachTo(this);
		this.options.add(option);
	}

	public String getId() {
		return id;
	}

	public String getQuestionText() {
		return questionText;
	}

	public void setQuestionText(String questionText) {
		this.questionText = questionText;
	}

	public String getCorrectOptionId() {
		return correctOptionId;
	}

	public void setCorrectOptionId(String correctOptionId) {
		this.correctOptionId = correctOptionId;
	}

	public String getExplanation() {
		return explanation;
	}

	public void setExplanation(String explanation) {
		this.explanation = explanation;
	}

	public Difficulty getDifficulty() {
		return difficulty;
	}

	public void setDifficulty(Difficulty difficulty) {
		this.difficulty = difficulty;
	}

	public SourceType getSourceType() {
		return sourceType;
	}

	public void setSourceType(SourceType sourceType) {
		this.sourceType = sourceType;
	}

	public String getExam() {
		return exam;
	}

	public void setExam(String exam) {
		this.exam = exam;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getChapter() {
		return chapter;
	}

	public void setChapter(String chapter) {
		this.chapter = chapter;
	}

	public String getTopic() {
		return topic;
	}

	public void setTopic(String topic) {
		this.topic = topic;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void touch(Instant now) {
		this.updatedAt = now;
	}

	public List<QuestionOptionEntity> getOptions() {
		return options;
	}

	/** Replaces the option set; caller must flush between clear and add. */
	public void clearOptions() {
		this.options.clear();
	}
}
