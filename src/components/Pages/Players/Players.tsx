import React, { useState, useEffect, useContext } from 'react';
import './Players.css';
import { UserContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../constants/path';
import { getUserPlayers, PlayerData } from '../../../utils/authStorageUtils';

const Players = () => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const { setUserPlayers, currentUserId } = useContext(UserContext);
  const navigate = useNavigate();

  const getSourceIcon = (url: string) => {
    if (!url) return null;
    if (url.includes('docs.google.com')) {
      return { icon: '📊', name: 'Google Sheets' };
    } else if (url.includes('onedrive') || url.includes('sharepoint') || url.includes('.xlsx')) {
      return { icon: '📑', name: 'Microsoft Excel' };
    }
    return { icon: '🔗', name: 'External Link' };
  };

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const data = getUserPlayers(currentUserId);
    if (data) {
      setPlayerData(data);
      setUserPlayers(data.players);
    } else {
      setPlayerData(null);
      setUserPlayers([]);
    }
  }, [currentUserId, setUserPlayers]);

  return (
    <div className="players-page">
      <div className="players-header">
        <h1>Club Roster</h1>
        <p className="players-subtitle">A growing overview of your players, ratings, and strengths.</p>
      </div>

      {!playerData ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Players Imported</h3>
          <p>You haven't imported any players yet. Add them here and then jump into the team builder when you're ready.</p>
          <button 
            className="primary-button" 
            onClick={() => navigate(PATH.CREATE_TEAMS_PATH)}
          >
            Import Players
          </button>
        </div>
      ) : (
        <div className="players-container">
          <div className="import-info">
            <div className="info-header">
              <span className="info-label">Import Details</span>
              <span className="player-count-badge">{playerData.players.length}</span>
            </div>
            <div className="info-content">
              <div className="info-row">
                <span className="info-key">Type:</span>
                <span className="info-value">{playerData.importType}</span>
                {playerData.importUrl && getSourceIcon(playerData.importUrl) && (
                  <>
                    <span className="info-separator">•</span>
                    <span className="info-key">Source:</span>
                    <a 
                      href={playerData.importUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="source-icon-link"
                      title={getSourceIcon(playerData.importUrl)?.name}
                    >
                      {getSourceIcon(playerData.importUrl)?.icon}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="players-list-section">
            <h2 className="list-title">Player List</h2>
            <div className="players-list">
              {playerData.players.map((player, index) => (
                <div key={index} className="player-card">
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className="player-attributes">
                      {player.attributes?.net && <span className="attribute-chip">Net</span>}
                      {player.attributes?.shooter && <span className="attribute-chip">Shooter</span>}
                    </div>
                  </div>
                  <div className="player-rating-badge">{player.rating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;
