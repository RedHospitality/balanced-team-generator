import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { PATH } from '../constants/path';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToPlayers = () => {
    navigate(PATH.PLAYER_PATH);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">About Draft Master</h1>
      <p className="description">
        Draft Master helps a club keep one shared view of its players and turn that roster into balanced teams for practice, scrimmages, or match day.
      </p>

      <div className="features-container">
        <ul className="features-list">
          <li>🏐 Start with a volleyball roster and keep adding players as your club grows</li>
          <li>📊 Store each player’s rating and optional strengths like Net or Shooter</li>
          <li>⚖️ Use your saved roster to create balanced teams with the Team Builder</li>
          <li>🔄 Keep the structure flexible so future sports can be added without changing the core flow</li>
        </ul>
      </div>

      <div className="bottom-area">
        <button onClick={handleNavigateToPlayers} className="login-button">
          View Players
        </button>
      </div>
    </div>
  );
};

export default Home;
