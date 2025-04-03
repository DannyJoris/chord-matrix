import Quiz1 from './quizzes/Quiz1';
import Quiz2 from './quizzes/Quiz2';

const Quizzes = () => {
  return (
    <div className="quiz-container">
      <Quiz1 />
      <Quiz2 />
      <div className="quiz">
        Guess the chord from the notes
      </div>
      <div className="quiz">
        Guess the notes from the chord
      </div>
    </div>
  );
};

export default Quizzes;