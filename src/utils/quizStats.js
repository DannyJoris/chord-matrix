const STORAGE_PREFIX = 'chord_quiz_';

const getQuizKey = (quizId) => `${STORAGE_PREFIX}${quizId}`;

const initQuizStats = (quizId) => {
  const storageKey = getQuizKey(quizId);
  if (!localStorage.getItem(storageKey)) {
    const initialStats = {
      totalGuesses: 0,
      correctGuesses: 0
    };
    localStorage.setItem(storageKey, JSON.stringify(initialStats));
  }
};

export const getQuizStats = (quizId) => {
  initQuizStats(quizId);
  return JSON.parse(localStorage.getItem(getQuizKey(quizId)));
};

export const recordGuess = (quizId, isCorrect) => {
  const stats = getQuizStats(quizId);
  
  stats.totalGuesses += 1;
  if (isCorrect) {
    stats.correctGuesses += 1;
  }

  localStorage.setItem(getQuizKey(quizId), JSON.stringify(stats));
  
  return stats;
};

export const getAccuracy = (quizId) => {
  const quizStats = getQuizStats(quizId);
  return quizStats.totalGuesses === 0 
    ? 0 
    : Math.round((quizStats.correctGuesses / quizStats.totalGuesses) * 100);
};

export const resetStats = (quizId) => {
  const initialStats = {
    totalGuesses: 0,
    correctGuesses: 0
  };
  localStorage.setItem(getQuizKey(quizId), JSON.stringify(initialStats));
};

export const getAllQuizIds = () => {
  const quizIds = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_PREFIX)) {
      quizIds.push(key.substring(STORAGE_PREFIX.length));
    }
  }
  return quizIds;
};

export const clearAllStats = () => {
  getAllQuizIds().forEach(quizId => {
    localStorage.removeItem(getQuizKey(quizId));
  });
}; 