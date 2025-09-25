import { Timestamp } from "firebase/firestore";

export type Question = {
  id: string;
  toUserId: string;
  questionText: string;
  answerText: string | null;
  isAnswered: boolean;
  createdAt: Date | Timestamp;
  answeredAt: Date | Timestamp | null;
};
