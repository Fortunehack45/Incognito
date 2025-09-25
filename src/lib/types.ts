import { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  createdAt: Date | Timestamp;
};

export type Question = {
  id: string;
  toUserId: string;
  questionText: string;
  answerText: string | null;
  isAnswered: boolean;
  createdAt: Date | Timestamp;
  answeredAt: Date | Timestamp | null;
};
