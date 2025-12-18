
export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getFeedbackMessage = (score: number, total: number): string => {
  const ratio = score / total;
  if (ratio === 1) return "Ôi tuyệt vời! Em giỏi quá đi mất! Điểm 10 tuyệt đối luôn nè! 🥳✨";
  if (ratio >= 0.8) return "Em làm tốt lắm luôn! Chỉ thiếu một xíu nữa là được điểm 10 rồi. Cố lên em nhé! 🌟";
  if (ratio >= 0.5) return "Em đã rất cố gắng rồi! Em hãy xem lại các câu sai để nhớ bài hơn nha! ❤️";
  return "Không sao đâu nè, em đừng buồn nhé! Hãy ôn bài kỹ hơn và làm lại cùng cô nha! 🌸";
};
