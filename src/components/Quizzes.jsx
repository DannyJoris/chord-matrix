import Quiz1 from './quizzes/Quiz1';
import Quiz2 from './quizzes/Quiz2';
import Quiz3 from './quizzes/Quiz3';
import Quiz4 from './quizzes/Quiz4';

const Quizzes = () => {
  return (
    <div className="quiz-container">
      <Quiz1 />
      <Quiz2 />
      <Quiz3 />
      <Quiz4 />
    </div>
  );
};

export default Quizzes;