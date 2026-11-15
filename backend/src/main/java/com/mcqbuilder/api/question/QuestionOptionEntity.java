package com.mcqbuilder.api.question;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * One answer choice. The id is part of the API contract: the frontend's
 * correctOptionId references an option by id, never by position, so options
 * can be reordered without silently repointing the answer.
 */
@Entity
@Table(name = "question_option")
public class QuestionOptionEntity {

	@Id
	@Column(name = "id", length = 36, nullable = false, updatable = false)
	private String id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "question_id", nullable = false)
	private QuestionEntity question;

	/** 0-based slot A..D. Kept explicit so option order survives a round trip. */
	@Column(name = "display_order", nullable = false)
	private int displayOrder;

	@Column(name = "text", length = 500, nullable = false)
	private String text;

	protected QuestionOptionEntity() {
		// for JPA
	}

	public QuestionOptionEntity(String id, int displayOrder, String text) {
		this.id = id;
		this.displayOrder = displayOrder;
		this.text = text;
	}

	public String getId() {
		return id;
	}

	public int getDisplayOrder() {
		return displayOrder;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	void attachTo(QuestionEntity question) {
		this.question = question;
	}
}
