package com.mcqbuilder.api.question;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<QuestionEntity, String> {

	/** Newest first, matching the frontend's ordering contract. */
	List<QuestionEntity> findAllByOrderByUpdatedAtDesc();
}
