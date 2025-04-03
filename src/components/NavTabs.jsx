import React from 'react';

const NavTabs = ({ activeTab, onTabChange }) => {
  return (
    <ul className="nav nav-tabs mb-4">
      <li className="nav-item">
        <button 
          className={`nav-link ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => onTabChange('matrix')}
        >
          Matrix
        </button>
      </li>
      <li className="nav-item">
        <button 
          className={`nav-link ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => onTabChange('quizzes')}
        >
          Quizzes
        </button>
      </li>
    </ul>
  );
};

export default NavTabs;