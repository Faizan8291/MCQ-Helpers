-- Schema for the MCQ question bank.
--
-- The shape mirrors the frontend domain types (frontend/src/features/questions)
-- one-for-one so the HTTP API can hand values straight through:
--   question        -> Question
--   question_option -> QuestionOption (exactly four per question)
--
-- The correct answer is stored as a foreign-key-style id (correct_option_id)
-- rather than an option index, so reordering options can never repoint it.
-- The constraint is enforced in the service layer because a real FK to
-- question_option would be circular (question -> option -> question).

CREATE TABLE question (
    id                CHAR(36)     NOT NULL,
    question_text     VARCHAR(1000) NOT NULL,
    correct_option_id CHAR(36)     NOT NULL,
    explanation       VARCHAR(2000) NOT NULL DEFAULT '',
    difficulty        VARCHAR(10)  NOT NULL,
    source_type       VARCHAR(10)  NOT NULL,
    exam              VARCHAR(100) NOT NULL DEFAULT '',
    subject           VARCHAR(100) NOT NULL DEFAULT '',
    chapter           VARCHAR(100) NOT NULL DEFAULT '',
    topic             VARCHAR(100) NOT NULL DEFAULT '',
    created_at        DATETIME(6)  NOT NULL,
    updated_at        DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_question_updated_at (updated_at),
    CONSTRAINT ck_question_difficulty CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    CONSTRAINT ck_question_source_type CHECK (source_type IN ('MANUAL', 'AI'))
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE question_option (
    id            CHAR(36)         NOT NULL,
    question_id   CHAR(36)         NOT NULL,
    display_order INT              NOT NULL,
    text          VARCHAR(500)     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_question_option_order (question_id, display_order),
    CONSTRAINT fk_question_option_question
        FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;
