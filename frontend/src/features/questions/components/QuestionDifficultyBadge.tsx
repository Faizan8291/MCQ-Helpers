import Badge, { type BadgeTone } from "@/components/ui/Badge";
import type { Difficulty } from "../types";

const DIFFICULTY_TONE: Record<Difficulty, BadgeTone> = {
  EASY: "success",
  MEDIUM: "warning",
  HARD: "danger",
};

export default function QuestionDifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge tone={DIFFICULTY_TONE[difficulty]}>{difficulty}</Badge>;
}
