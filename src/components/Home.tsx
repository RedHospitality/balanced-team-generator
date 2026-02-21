import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { PATH } from '../constants/path';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToCreateTeams = () => {
    navigate(PATH.CREATE_TEAMS_PATH);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Balanced Team Generator</h1>
      <p className="description">
        Create fair, balanced sports teams by distributing player ratings evenly across each team.
      </p>

      <div className="features-container">
        <ul className="features-list">
          <li>📊 Manual player entry</li>
          <li>📈 Google Sheets import</li>
          <li>⚖️ Balanced team distribution</li>
          <li>🔄 Easy regeneration</li>
        </ul>
      </div>

      <div className="algorithm-section">
        <h3>How It Works</h3>
        <div className="algorithm-diagram">
          {/* Input: Players */}
          <div className="diagram-item">
            <div className="players-box">
              <div className="player-list">
                <span>A <span className="stars">⭐⭐</span></span>
                <span>B <span className="stars">⭐⭐⭐⭐⭐</span></span>
                <span>C <span className="stars">⭐⭐⭐</span></span>
                <span>...</span>
                <span>N <span className="stars">⭐⭐⭐⭐⭐⭐</span></span>
              </div>
            </div>
            <p className="diagram-label">Players with Ratings</p>
          </div>
          
          {/* Arrow */}
          <div className="arrow">↓</div>
          
          {/* Process: Grouping into Teams */}
          <div className="diagram-item">
            <div className="process-box">
              <span className="teams-count">X Teams</span>
              <span className="volleyball-emoji">🏐</span>
            </div>
            <p className="diagram-label">Group into Teams</p>
          </div>
          
          {/* Arrow */}
          <div className="arrow">↓</div>
          
          {/* Output: Balanced Teams */}
          <div className="diagram-item">
            <div className="balanced-box">
              <div className="team-list">
                <span>Team 1</span>
                <span>Team 2</span>
                <span>...</span>
                <span>Team X</span>
              </div>
            </div>
            <p className="diagram-label">Balanced Teams</p>
          </div>
        </div>
      </div>

      <div className="bottom-area">
        <button onClick={handleNavigateToCreateTeams} className="login-button">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;
