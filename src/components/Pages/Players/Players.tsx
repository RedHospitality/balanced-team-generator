import React, { useState, useEffect, useContext } from 'react';
import './Players.css';
import { UserContext } from '../../../App';
import { getPlayerData, PlayerData } from '../../../utils/cookieUtils';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../constants/path';

const Players = () => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const { setUserPlayers } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const data = getPlayerData();
    if (data) {
      setPlayerData(data);
      setUserPlayers(data.players);
    }
  }, [setUserPlayers]);

  return (
    <div>
      <h2>Players Page</h2>

      {!playerData ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>No Players Imported</h3>
          <p>You haven't imported any players yet. Go to Create Teams to import player data.</p>
          <button 
            className="edit-players-button" 
            onClick={() => navigate(PATH.CREATE_TEAMS_PATH)}
            style={{ marginTop: '20px' }}
          >
            Go to Create Teams
          </button>
        </div>
      ) : (
        <div className="container">
          <h3>Player List</h3>
          <div style={{ textAlign: 'center', marginBottom: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <strong>Total Players: {playerData.players.length}</strong>
          </div>
          <p style={{ marginBottom: '15px', color: '#666' }}>
            <strong>Import Type:</strong> {playerData.importType}
            {playerData.importUrl && (
              <span> | <strong>Source:</strong> {playerData.importUrl}</span>
            )}
          </p>

          {playerData.players.map((player, index) => (
            <div key={index} className="player-item">
              <div className="player-name">
                {player.name}
              </div>
              <div className="player-rating">
                {player.rating}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Players;
