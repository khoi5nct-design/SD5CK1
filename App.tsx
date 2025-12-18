
import React, { useState, useCallback, useMemo } from 'react';
import { QUESTIONS } from './data/questions';
import { QuizState, UserAnswer, Question } from './types';
import { shuffleArray, getFeedbackMessage } from './utils/helpers';
import ConfettiEffect from './components/ConfettiEffect';

// --- Sub-components ---

const LoginScreen: React.FC<{ onLogin: (name: string) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sky-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border-4 border-yellow-400">
        <h1 className="text-3xl font-bold text-sky-600 mb-6">Chào mừng em! 👋</h1>
        <p className="text-gray-600 mb-6 font-medium">Em hãy điền tên mình để bắt đầu luyện tập Lịch sử - Địa lí nhé!</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên của em là..."
          className="w-full px-4 py-3 rounded-full border-2 border-sky-300 focus:border-sky-500 outline-none mb-6 text-center text-xl font-semibold"
        />
        <button
          onClick={() => name.trim() && onLogin(name)}
          disabled={!name.trim()}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-sky-800 font-bold py-3 px-6 rounded-full shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        >
          BẮT ĐẦU NGAY! 🚀
        </button>
      </div>
    </div>
  );
};

const QuizScreen: React.FC<{
  userName: string;
  onFinish: (answers: UserAnswer[]) => void;
}> = ({ userName, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Shuffle questions ONLY. Keep options fixed as per user request.
  const shuffledQuestions = useMemo(() => {
    return shuffleArray(QUESTIONS);
  }, []);

  const currentQuestion = shuffledQuestions[currentIndex];

  const checkIsCorrect = (q: Question, ans: any): boolean => {
    if (q.type === 'MULTIPLE_CHOICE') return ans === q.correctAnswer;
    if (q.type === 'TRUE_FALSE_LIST') {
      const sequence = ans as boolean[];
      if (!sequence || sequence.some(v => v === null)) return false;
      return sequence.every((val, idx) => val === q.trueFalseSequence![idx]);
    }
    if (q.type === 'MULTIPLE_SELECT') {
      const selected = ans as string[];
      const correct = q.correctAnswer as string[];
      if (!selected) return false;
      return selected.length === correct.length && selected.every(id => correct.includes(id));
    }
    if (q.type === 'MATCHING') {
      const pairs = ans as Record<string, string>;
      if (!pairs) return false;
      return q.matchingPairs!.every(p => pairs[p.left] === p.right);
    }
    return false;
  };

  const handleNext = () => {
    const isCorrect = checkIsCorrect(currentQuestion, currentAnswer);
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      isCorrect
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer(null);
    } else {
      onFinish(updatedAnswers);
    }
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options?.map((opt, index) => {
              const label = String.fromCharCode(65 + index); // A, B, C, D
              return (
                <button
                  key={opt.id}
                  onClick={() => setCurrentAnswer(opt.id)}
                  className={`py-4 px-6 rounded-2xl border-2 text-left font-medium transition-all ${
                    currentAnswer === opt.id ? 'bg-sky-500 text-white border-sky-600 transform scale-[1.02]' : 'bg-white hover:bg-sky-50 border-sky-100 text-sky-900'
                  }`}
                >
                  <span className="font-bold mr-2">{label}.</span> {opt.text}
                </button>
              );
            })}
          </div>
        );
      case 'MULTIPLE_SELECT':
        const selected = (currentAnswer as string[]) || [];
        return (
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options?.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  const newSelected = selected.includes(opt.id)
                    ? selected.filter(i => i !== opt.id)
                    : [...selected, opt.id];
                  setCurrentAnswer(newSelected);
                }}
                className={`py-4 px-6 rounded-2xl border-2 text-left font-medium transition-all ${
                  selected.includes(opt.id) ? 'bg-green-500 text-white border-green-600 transform scale-[1.02]' : 'bg-white hover:bg-green-50 border-green-100 text-sky-900'
                }`}
              >
                <span className="inline-block w-6 h-6 border-2 border-current rounded mr-2 align-middle text-center leading-5">
                  {selected.includes(opt.id) ? '✓' : ''}
                </span>
                {opt.text}
              </button>
            ))}
          </div>
        );
      case 'TRUE_FALSE_LIST':
        const sequence = (currentAnswer as boolean[]) || Array(currentQuestion.statements?.length).fill(null);
        return (
          <div className="space-y-4">
            {currentQuestion.statements?.map((s, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-sky-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <p className="text-sky-900 flex-1 font-medium">{s}</p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const newSeq = [...sequence];
                      newSeq[idx] = true;
                      setCurrentAnswer(newSeq);
                    }}
                    className={`w-12 h-12 rounded-full font-bold border-2 transition-all ${sequence[idx] === true ? 'bg-green-500 text-white border-green-600 shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    Đ
                  </button>
                  <button
                    onClick={() => {
                      const newSeq = [...sequence];
                      newSeq[idx] = false;
                      setCurrentAnswer(newSeq);
                    }}
                    className={`w-12 h-12 rounded-full font-bold border-2 transition-all ${sequence[idx] === false ? 'bg-red-500 text-white border-red-600 shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    S
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'MATCHING':
        const pairs = (currentAnswer as Record<string, string>) || {};
        const leftItems = currentQuestion.matchingPairs!.map(p => p.left);
        const rightItems = currentQuestion.matchingPairs!.map(p => p.right);
        return (
          <div className="space-y-4">
             <p className="text-sm text-sky-500 italic mb-2">Em hãy chọn ô bên phải tương ứng với mốc thời gian bên trái nhé!</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                   {leftItems.map(left => (
                      <div
                        key={left}
                        className={`w-full p-4 text-sm border-2 rounded-xl text-left font-bold ${pairs[left] ? 'bg-sky-100 border-sky-400 text-sky-800' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                         {left}
                      </div>
                   ))}
                </div>
                <div className="space-y-3">
                   {rightItems.map((right, idx) => {
                      const leftKey = leftItems[idx];
                      return (
                         <select
                           key={idx}
                           className={`w-full p-4 text-sm border-2 rounded-xl bg-white shadow-sm focus:border-sky-500 outline-none ${pairs[leftKey] ? 'border-sky-400' : 'border-gray-200'}`}
                           value={pairs[leftKey] || ""}
                           onChange={(e) => {
                              const rightVal = e.target.value;
                              const newPairs = { ...pairs };
                              if (!rightVal) {
                                delete newPairs[leftKey];
                              } else {
                                newPairs[leftKey] = rightVal;
                              }
                              setCurrentAnswer(newPairs);
                           }}
                         >
                            <option value="">-- Chọn sự kiện cho {leftKey} --</option>
                            {rightItems.map(r => (
                               <option key={r} value={r}>{r}</option>
                            ))}
                         </select>
                      )
                   })}
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isComplete = () => {
    if (currentQuestion.type === 'MULTIPLE_CHOICE') return currentAnswer !== null;
    if (currentQuestion.type === 'MULTIPLE_SELECT') return currentAnswer && currentAnswer.length > 0;
    if (currentQuestion.type === 'TRUE_FALSE_LIST') return currentAnswer && currentAnswer.every((v: any) => v !== null);
    if (currentQuestion.type === 'MATCHING') return Object.keys(currentAnswer || {}).length === currentQuestion.matchingPairs!.length;
    return false;
  };

  return (
    <div className="min-h-screen bg-sky-50 py-8 px-4">
      {showConfetti && <ConfettiEffect type="single" />}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-sky-200">
          <div className="bg-sky-100 h-4">
            <div
              className="bg-yellow-400 h-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` }}
            ></div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-sky-100 text-sky-700 px-4 py-1 rounded-full font-bold">
                Câu {currentIndex + 1} / {shuffledQuestions.length}
              </span>
              <span className="text-gray-500 font-medium shrink-0">Học sinh: <span className="text-sky-600 font-bold">{userName}</span></span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-sky-900 mb-8 leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            {renderQuestionInput()}

            <div className="mt-8 flex justify-end">
              <button
                disabled={!isComplete()}
                onClick={handleNext}
                className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-sky-800 font-bold py-3 px-10 rounded-full shadow-lg transition-all active:scale-95"
              >
                {currentIndex === shuffledQuestions.length - 1 ? 'HOÀN THÀNH 🏁' : 'TIẾP TỤC ➔'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultsScreen: React.FC<{
  userName: string;
  answers: UserAnswer[];
  onRestart: () => void;
  onReview: () => void;
}> = ({ userName, answers, onRestart, onReview }) => {
  const correctCount = answers.filter(a => a.isCorrect).length;
  const score = (correctCount / answers.length) * 10;
  const isPerfect = score === 10;

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      {isPerfect && <ConfettiEffect type="explosion" />}
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-2xl w-full text-center border-8 border-yellow-300 relative overflow-hidden">
        {isPerfect && (
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-sky-400 to-pink-500 animate-[gradient_2s_linear_infinite] bg-[length:200%_auto]"></div>
        )}
        <h2 className="text-3xl font-bold text-pink-600 mb-4">Kết Quả Của Em: {userName}! 🎉</h2>
        
        <div className="flex flex-col items-center justify-center mb-8">
           <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 mb-4 shadow-inner ${isPerfect ? 'bg-yellow-100 border-yellow-400 animate-bounce' : 'bg-sky-100 border-sky-400'}`}>
              <span className={`text-5xl font-bold ${isPerfect ? 'text-yellow-600' : 'text-sky-600'}`}>
                {score % 1 === 0 ? score : score.toFixed(1)}
              </span>
           </div>
           <p className="text-xl text-gray-700 italic font-medium px-4 leading-relaxed">
              "{getFeedbackMessage(correctCount, answers.length)}"
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <button
            onClick={onReview}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 px-6 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <span>XEM LẠI BÀI LÀM</span> 📝
          </button>
          <button
            onClick={onRestart}
            className="bg-yellow-400 hover:bg-yellow-500 text-sky-800 font-bold py-4 px-6 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <span>LÀM LẠI NÈ</span> 🔄
          </button>
        </div>
      </div>
    </div>
  );
};

const ReviewScreen: React.FC<{
  answers: UserAnswer[];
  onBackToResults: () => void;
}> = ({ answers, onBackToResults }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50 py-4 border-b z-10">
          <h2 className="text-2xl font-bold text-sky-900">Chi tiết bài làm</h2>
          <button
            onClick={onBackToResults}
            className="bg-white border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white font-bold py-2 px-8 rounded-full transition-all"
          >
            Quay lại
          </button>
        </div>

        <div className="space-y-6">
          {QUESTIONS.map((q, idx) => {
            const userAnswer = answers.find(a => a.questionId === q.id);
            return (
              <div key={q.id} className={`p-6 rounded-2xl border-2 shadow-sm ${userAnswer?.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-start gap-4">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white shadow-md ${userAnswer?.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {userAnswer?.isCorrect ? '✓' : '✗'}
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-3 text-lg leading-snug">{idx + 1}. {q.questionText}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-white/50 p-3 rounded-xl">
                          <p className="font-bold text-gray-500 text-xs uppercase mb-1">Đáp án đúng: </p>
                          <p className="text-green-700 font-medium">
                            {q.type === 'MULTIPLE_CHOICE' && q.options?.find(o => o.id === q.correctAnswer)?.text}
                            {q.type === 'TRUE_FALSE_LIST' && q.trueFalseSequence?.map(b => b ? 'Đ' : 'S').join(' - ')}
                            {q.type === 'MULTIPLE_SELECT' && (q.correctAnswer as string[]).map(id => q.options?.find(o => o.id === id)?.text).join(', ')}
                            {q.type === 'MATCHING' && q.matchingPairs?.map(p => `[${p.left} → ${p.right}]`).join('; ')}
                          </p>
                        </div>

                        <div className="bg-white/50 p-3 rounded-xl">
                          <p className="font-bold text-gray-500 text-xs uppercase mb-1">Em đã chọn: </p>
                          <p className={`${userAnswer?.isCorrect ? 'text-green-700' : 'text-red-700'} font-medium`}>
                            {q.type === 'MULTIPLE_CHOICE' && (q.options?.find(o => o.id === userAnswer?.answer)?.text || "(Chưa chọn)")}
                            {q.type === 'TRUE_FALSE_LIST' && (userAnswer?.answer as boolean[])?.map(b => b === null ? '?' : (b ? 'Đ' : 'S')).join(' - ')}
                            {q.type === 'MULTIPLE_SELECT' && (userAnswer?.answer as string[])?.length ? (userAnswer?.answer as string[])?.map(id => q.options?.find(o => o.id === id)?.text).join(', ') : "(Chưa chọn)"}
                            {q.type === 'MATCHING' && (userAnswer?.answer && Object.keys(userAnswer.answer).length > 0) ? Object.entries(userAnswer?.answer || {}).map(([l, r]) => `[${l} → ${r}]`).join('; ') : "(Chưa ghép)"}
                          </p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'LOGIN' | 'QUIZ' | 'RESULTS' | 'REVIEW'>('LOGIN');
  const [userName, setUserName] = useState('');
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  const handleLogin = (name: string) => {
    setUserName(name);
    setGameState('QUIZ');
  };

  const handleFinish = (answers: UserAnswer[]) => {
    setUserAnswers(answers);
    setGameState('RESULTS');
  };

  const handleRestart = () => {
    setUserAnswers([]);
    setGameState('QUIZ');
  };

  const handleReview = () => {
    setGameState('REVIEW');
  };

  const handleBackToResults = () => {
    setGameState('RESULTS');
  };

  return (
    <div className="antialiased text-gray-900">
      {gameState === 'LOGIN' && <LoginScreen onLogin={handleLogin} />}
      {gameState === 'QUIZ' && <QuizScreen userName={userName} onFinish={handleFinish} />}
      {gameState === 'RESULTS' && (
        <ResultsScreen
          userName={userName}
          answers={userAnswers}
          onRestart={handleRestart}
          onReview={handleReview}
        />
      )}
      {gameState === 'REVIEW' && (
        <ReviewScreen
          answers={userAnswers}
          onBackToResults={handleBackToResults}
        />
      )}
    </div>
  );
};

export default App;
