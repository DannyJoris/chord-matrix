import React, { useState } from 'react';
import { Title } from './components/Title';
import NavTabs from './components/NavTabs';
import Matrix from './components/Matrix';
import Quizzes from './components/Quizzes';

const App = () => {
  const [activeTab, setActiveTab] = useState('matrix');

  return (
    <main className="main p-4">
      <Title />
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'matrix' && <Matrix />}
      {activeTab === 'quizzes' && <Quizzes />}
    </main>
  )
};

export default App;
