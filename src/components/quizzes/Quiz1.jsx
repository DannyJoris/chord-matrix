import { getQuiz1 } from '../../utils/quizzes';
import { useState, useEffect } from 'react';
import { recordGuess, getQuizStats, resetStats, getAccuracy } from '../../utils/quizStats';

const QUIZ_ID = 'quiz1';

const Quiz1 = () => {
  const [randomChord, setRandomChord] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState({ totalGuesses: 0, correctGuesses: 0 });
  const quiz1data = getQuiz1();
  const options = quiz1data.map(chord => chord.alias);
  
  const getRandomChord = () => {
    const randomIndex = Math.floor(Math.random() * quiz1data.length);
    return quiz1data[randomIndex];
  };

  useEffect(() => {
    setRandomChord(getRandomChord());
    setStats(getQuizStats(QUIZ_ID));
  }, []);

  const handleOptionClick = (option) => {
    const correct = option === randomChord.alias;

    const updatedStats = recordGuess(QUIZ_ID, correct);
    setStats(updatedStats);

    if (correct) {
      setIsCorrect(true);
      setTimeout(() => {
        setRandomChord(getRandomChord());
        setSelectedOptions([]);
        setIsCorrect(false);
      }, 1000);
    }

    setSelectedOptions((prevSelected) => {
      if (prevSelected.includes(option)) {
        return prevSelected;
      } else {
        return [...prevSelected, option];
      }
    });
  };

  const handleResetStats = () => {
    resetStats(QUIZ_ID);
    setStats({ totalGuesses: 0, correctGuesses: 0 });
  };

  const getButtonClass = (option) => {
    if (selectedOptions.includes(option)) {
      if (option === randomChord.alias) {
        return 'btn-success';
      }
      return 'btn-secondary';
    }
    return 'btn-light';
  };

  const buttonStyle = {
    opacity: '1',
    cursor: isCorrect ? 'default' : 'pointer'
  };

  const accuracy = getAccuracy(QUIZ_ID);

  return (
    <div className="quiz">
      <h2 className="quiz-title h5">Guess the chord quality from the intervals</h2>
      
      <div className="quiz-stats">
        <p className="small">
          Score: {stats.correctGuesses} / {stats.totalGuesses} ({accuracy}% accuracy)
        </p>
        <button 
          className="btn btn-sm btn-link link-danger" 
          onClick={handleResetStats}
        >
          Reset Stats
        </button>
      </div>
      
      {randomChord && (
        <div className="quiz-content">
          <ul className="quiz-question-list">
            {randomChord.intervals.map(interval => (
              <li key={interval} className="quiz-question-list-item">
                {interval}
              </li>
            ))}
          </ul>
          <hr className="quiz-divider" />
          <ul className="quiz-answer-list">
            {options.map(option => (
              <li key={option} className="quiz-answer-item">
                <button 
                  className={`btn ${getButtonClass(option)}`}
                  onClick={() => handleOptionClick(option)}
                  disabled={isCorrect}
                  style={buttonStyle}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Quiz1;