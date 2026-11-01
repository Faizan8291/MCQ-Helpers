import { Question } from "./types";

/**
 * Seed data for the mock question bank (Milestone 1 only).
 *
 * Dates are fixed ISO strings so tests and screenshots are deterministic.
 * All seeds are sourceType MANUAL — the AI flow does not exist yet.
 */
export const mockQuestions: Question[] = [
  {
    id: "seed-q1",
    questionText: "Which of the following is the SI unit of force?",
    options: [
      { id: "seed-q1-a", text: "Joule" },
      { id: "seed-q1-b", text: "Newton" },
      { id: "seed-q1-c", text: "Watt" },
      { id: "seed-q1-d", text: "Pascal" },
    ],
    correctOptionId: "seed-q1-b",
    explanation: "The SI unit of force is the newton (N), defined as kilogram-metre per second squared.",
    difficulty: "EASY",
    sourceType: "MANUAL",
    metadata: { exam: "SSC CGL", subject: "Physics", chapter: "Units and Measurements", topic: "SI Units" },
    createdAt: "2026-10-15T09:00:00.000Z",
    updatedAt: "2026-10-15T09:00:00.000Z",
  },
  {
    id: "seed-q2",
    questionText: "If a train travels 240 km in 3 hours, what is its average speed?",
    options: [
      { id: "seed-q2-a", text: "60 km/h" },
      { id: "seed-q2-b", text: "80 km/h" },
      { id: "seed-q2-c", text: "40 km/h" },
      { id: "seed-q2-d", text: "120 km/h" },
    ],
    correctOptionId: "seed-q2-a",
    explanation: "Average speed = total distance / total time = 240 km / 3 h = 60 km/h.",
    difficulty: "MEDIUM",
    sourceType: "MANUAL",
    metadata: {
      exam: "Bank PO",
      subject: "Quantitative Aptitude",
      chapter: "Speed, Time and Distance",
      topic: "Average Speed",
    },
    createdAt: "2026-10-16T10:30:00.000Z",
    updatedAt: "2026-10-16T10:30:00.000Z",
  },
  {
    id: "seed-q3",
    questionText:
      "The Directive Principles of State Policy in the Constitution of India were borrowed from the constitution of which country?",
    options: [
      { id: "seed-q3-a", text: "United States of America" },
      { id: "seed-q3-b", text: "Ireland" },
      { id: "seed-q3-c", text: "Canada" },
      { id: "seed-q3-d", text: "Australia" },
    ],
    correctOptionId: "seed-q3-b",
    explanation: "The Directive Principles of State Policy were borrowed from the Irish Constitution.",
    difficulty: "HARD",
    sourceType: "MANUAL",
    metadata: {
      exam: "UPSC CSE",
      subject: "Polity",
      chapter: "Fundamental Rights and DPSP",
      topic: "Directive Principles",
    },
    createdAt: "2026-10-17T14:15:00.000Z",
    updatedAt: "2026-10-17T14:15:00.000Z",
  },
  {
    id: "seed-q4",
    questionText: "Which cell organelle is commonly called the powerhouse of the cell?",
    options: [
      { id: "seed-q4-a", text: "Ribosome" },
      { id: "seed-q4-b", text: "Mitochondria" },
      { id: "seed-q4-c", text: "Golgi apparatus" },
      { id: "seed-q4-d", text: "Lysosome" },
    ],
    correctOptionId: "seed-q4-b",
    explanation: "Mitochondria produce most of the cell's ATP through aerobic respiration.",
    difficulty: "EASY",
    sourceType: "MANUAL",
    metadata: { exam: "NEET UG", subject: "Biology", chapter: "Cell: The Unit of Life", topic: "Cell Organelles" },
    createdAt: "2026-10-18T08:45:00.000Z",
    updatedAt: "2026-10-18T08:45:00.000Z",
  },
];
