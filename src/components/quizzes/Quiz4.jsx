import { Note } from 'tonal';

import { useState, useEffect } from 'react';
import { recordGuess, getQuizStats, resetStats, getAccuracy } from '../../utils/quizStats';
import { getRandomChord } from '../../utils/getChords';
import { getSelectedNotesMerged } from '../../utils/notes';

const QUIZ_ID = 'quiz4';

const Quiz4 = () => {
  const [randomChord, setRandomChord] = useState(null);
  const [isIncorrect, setIsIncorrect] = useState([]);
  const [isCorrect, setIsCorrect] = useState([]);
  const [stats, setStats] = useState({ totalGuesses: 0, correctGuesses: 0 });

  const noteOptions = getSelectedNotesMerged();
  const allCorrect = randomChord && isCorrect.length === randomChord.notes.length;

  console.log(randomChord);

  useEffect(() => {
    setRandomChord(getRandomChord());
    setStats(getQuizStats(QUIZ_ID));
  }, []);

  useEffect(() => {
      if (randomChord && isCorrect.length === randomChord.notes.length) {
        const updatedStats = recordGuess(QUIZ_ID, true);
        setStats(updatedStats);
        setTimeout(() => {
          setRandomChord(getRandomChord());
          setIsCorrect([]);
          setIsIncorrect([]);
      }, 1000);
    }
  }, [isCorrect, randomChord]);

  const handleOptionClick = (option) => {
    let correct = false;

    if (option.includes('/')) {
      const optionParts = option.split('/').map(part => part.trim());
      correct = optionParts.some(part => randomChord.notes.map(note => Note.simplify(note)).includes(part));
    } else {
      correct = randomChord.notes.map(note => Note.simplify(note)).includes(option);
    }

    if (correct) {
      setIsCorrect(prev => [...prev, option]);
      
    } else {
      setIsIncorrect(prev => [...prev, option]);
      const updatedStats = recordGuess(QUIZ_ID, false);
      setStats(updatedStats);
    }
  };

  const handleResetStats = () => {
    resetStats(QUIZ_ID);
    setStats({ totalGuesses: 0, correctGuesses: 0 });
  };

  const getButtonClass = (option) => {
    if (isCorrect.includes(option)) {
      return 'btn-success';
    }
    if (isIncorrect.includes(option)) {
      return 'btn-secondary';
    }
    return 'btn-light';
  };

  const buttonStyle = {
    opacity: '1',
  };

  const accuracy = getAccuracy(QUIZ_ID);

  return (
    <div className="quiz">
      <h2 className="quiz-title h5">Guess the notes from the chord</h2>
      
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
              {randomChord.symbol.replaceAll('#', '♯').replaceAll('b', '♭')}
            </li>
          </ul>
          <hr className="quiz-divider" />
          <ul className="quiz-answer-list">
            {noteOptions.map(option => (
              <li key={option} className="quiz-answer-item">
                <button 
                  className={`btn ${getButtonClass(option)}`}
                  onClick={() => handleOptionClick(option)}
                  disabled={isCorrect.includes(option) || isIncorrect.includes(option) || allCorrect}
                  style={buttonStyle}
                >
                  {option.replaceAll('#', '♯').replaceAll('b', '♭')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Quiz4;
