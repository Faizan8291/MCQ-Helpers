package com.mcqbuilder.api.question;

/**
 * Where a question came from. AI questions will stay drafts until a teacher
 * approves them, so the column exists from day one and never needs a migration.
 */
public enum SourceType {
	MANUAL,
	AI
}
