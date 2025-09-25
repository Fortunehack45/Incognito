export type User = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  createdAt: Date;
};

export type Question = {
  id: string;
  toUserId: string;
  questionText: string;
  answerText: string | null;
  isAnswered: boolean;
  createdAt: Date;
  answeredAt: Date | null;
};
