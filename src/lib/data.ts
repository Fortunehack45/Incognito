import type { User, Question } from './types';

// In a real application, this data would be in a database.
// We are mocking it here for demonstration purposes.

const users: User[] = [
  {
    id: '1',
    username: 'sarah',
    email: 'sarah@example.com',
    bio: 'Frontend developer and cat enthusiast. Ask me anything about React or CSS!',
    createdAt: new Date('2023-10-01T10:00:00Z'),
  },
  {
    id: '2',
    username: 'john',
    email: 'john@example.com',
    bio: 'Lover of spicy food and hiking. Curious about my adventures? Ask away.',
    createdAt: new Date('2023-11-15T14:30:00Z'),
  },
];

const questions: Question[] = [
  {
    id: 'q1',
    toUserId: '1',
    questionText: 'What is your favorite CSS trick?',
    answerText: 'Definitely using `clamp()` for responsive typography. It is a game changer!',
    isAnswered: true,
    createdAt: new Date('2023-10-02T11:00:00Z'),
    answeredAt: new Date('2023-10-02T15:00:00Z'),
  },
  {
    id: 'q2',
    toUserId: '1',
    questionText: 'What is the most challenging part of being a frontend developer?',
    answerText: 'Keeping up with the ever-evolving ecosystem of tools and frameworks. It is both exciting and daunting!',
    isAnswered: true,
    createdAt: new Date('2023-10-03T09:20:00Z'),
    answeredAt: new Date('2023-10-03T12:00:00Z'),
  },
  {
    id: 'q3',
    toUserId: '1',
    questionText: 'Do you prefer tabs or spaces?',
    answerText: null,
    isAnswered: false,
    createdAt: new Date('2023-10-04T18:00:00Z'),
    answeredAt: null,
  },
  {
    id: 'q4',
    toUserId: '1',
    questionText: 'This is an inappropriate question meant for testing.',
    answerText: null,
    isAnswered: false,
    createdAt: new Date('2023-10-05T10:00:00Z'),
    answeredAt: null,
  },
  {
    id: 'q5',
    toUserId: '2',
    questionText: 'What is the spiciest thing you have ever eaten?',
    answerText: 'A ghost pepper curry in India. My face was numb for an hour but it was worth it!',
    isAnswered: true,
    createdAt: new Date('2023-11-16T10:00:00Z'),
    answeredAt: new Date('2023-11-16T18:00:00Z'),
  },
  {
    id: 'q6',
    toUserId: '2',
    questionText: 'Favorite hiking trail?',
    answerText: null,
    isAnswered: false,
    createdAt: new Date(),
    answeredAt: null,
  },
];

// --- Mock API Functions ---
// In a real app, these would be database queries.

export async function getUserByUsername(username: string): Promise<User | undefined> {
  return users.find((user) => user.username === username);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return users.find((user) => user.email === email);
}

export async function getUserById(id: string): Promise<User | undefined> {
    return users.find((user) => user.id === id);
}

export async function getQuestionsForUser(userId: string): Promise<Question[]> {
  return questions.filter((q) => q.toUserId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function addQuestion(toUserId: string, questionText: string): Promise<Question> {
  const newQuestion: Question = {
    id: `q${questions.length + 1}`,
    toUserId,
    questionText,
    answerText: null,
    isAnswered: false,
    createdAt: new Date(),
    answeredAt: null,
  };
  questions.unshift(newQuestion);
  return newQuestion;
}

export async function answerQuestion(questionId: string, answerText: string): Promise<Question | undefined> {
  const question = questions.find((q) => q.id === questionId);
  if (question) {
    question.isAnswered = true;
    question.answerText = answerText;
    question.answeredAt = new Date();
  }
  return question;
}

export async function deleteQuestion(questionId: string): Promise<boolean> {
    const index = questions.findIndex((q) => q.id === questionId);
    if (index > -1) {
        questions.splice(index, 1);
        return true;
    }
    return false;
}

export async function addUser(details: Omit<User, 'id' | 'createdAt' | 'bio'>): Promise<User> {
    const newUser: User = {
        id: `${users.length + 1}`,
        ...details,
        bio: null,
        createdAt: new Date(),
    };
    users.push(newUser);
    return newUser;
}

export async function getQuestionById(questionId: string): Promise<Question | undefined> {
    return questions.find((q) => q.id === questionId);
}
