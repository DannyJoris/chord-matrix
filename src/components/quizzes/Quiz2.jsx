import { getQuiz1 } from '../../utils/quizzes';
import { useState, useEffect } from 'react';
import { recordGuess, getQuizStats, resetStats, getAccuracy } from '../../utils/quizStats';

import { getAllIntervals } from '../../utils/intervals';

const QUIZ_ID = 'quiz2';

const Quiz2 = () => {
  const [randomChord, setRandomChord] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState({ totalGuesses: 0, correctGuesses: 0 });
  const quiz1data = getQuiz1();
  const options = getAllIntervals();

  console.log(options);

  const getRandomChord = () => {
    const randomIndex = Math.floor(Math.random() * quiz1data.length);
    return quiz1data[randomIndex];
  };

  useEffect(() => {
    setRandomChord(getRandomChord());
    setStats(getQuizStats(QUIZ_ID));
  }, []);

  const handleOptionClick = (option) => {
    // Check if the option is correct
    console.log(option);
    const correct = randomChord.intervals.filter(interval => option.includes(interval));
    console.log(correct);
    
    // const correct = option === randomChord.alias;
    
    // const updatedStats = recordGuess(QUIZ_ID, correct);
    // setStats(updatedStats);
    
    // if (correct) {
    //   setIsCorrect(true);
    //   setTimeout(() => {
    //     setRandomChord(getRandomChord());
    //     setSelectedOptions([]);
    //     setIsCorrect(false);
    //   }, 1500);
    // }

    // setSelectedOptions((prevSelected) => {
    //   if (prevSelected.includes(option)) {
    //     return prevSelected;
    //   } else {
    //     return [...prevSelected, option];
    //   }
    // });
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
      <h2 className="quiz-title h5">Guess the intervals from the chord</h2>
      
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
            <li className="quiz-question-list-item">
              {randomChord.alias}
            </li>
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
      {randomChord && randomChord.intervals.map(interval => (
        <div key={interval}>{interval}</div>
      ))}
    </div>
  );
};

export default Quiz2;