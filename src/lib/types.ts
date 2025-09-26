import { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  createdAt: Date | Timestamp;
  isModerationEnabled: boolean;
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

export type Note = {
    id: string;
    contentText: string;
    createdAt: Date | Timestamp;
};
