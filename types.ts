
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE_LIST' | 'MATCHING' | 'MULTIPLE_SELECT';

export interface Option {
  id: string;
  text: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  topic: number;
  type: QuestionType;
  questionText: string;
  options?: Option[];
  correctAnswer?: string | string[]; // For MULTIPLE_CHOICE or MULTIPLE_SELECT
  trueFalseSequence?: boolean[]; // For TRUE_FALSE_LIST (true = Đ, false = S)
  statements?: string[];
  matchingPairs?: MatchingPair[];
}

export interface UserAnswer {
  questionId: string;
  answer: any;
  isCorrect: boolean;
}

export interface QuizState {
  userName: string;
  score: number;
  answers: UserAnswer[];
  isFinished: boolean;
}
