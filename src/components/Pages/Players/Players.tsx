import React, { useState, useEffect, useContext, useMemo } from 'react';
import './Players.css';
import { UserContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../constants/path';
import { getUserPlayers, PlayerData } from '../../../utils/authStorageUtils';
import PlayersImport from '../CreateTeamsWorflow/PlayersImport/PlayersImport';

const Players = () => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const { setUserPlayers, currentUserId } = useContext(UserContext);
  const navigate = useNavigate();

  const sortedPlayers = useMemo(() => (
    [...(playerData?.players ?? [])].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  ), [playerData]);

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
    const loadPlayers = async () => {
      if (!currentUserId) {
        setPlayerData(null);
        setUserPlayers([]);
        return;
      }

      const data = await getUserPlayers(currentUserId);
      if (data) {
        setPlayerData(data);
        setUserPlayers(data.players);
      } else {
        setPlayerData(null);
        setUserPlayers([]);
      }
    };

    void loadPlayers();
  }, [currentUserId, setUserPlayers]);

  return (
    <div className="players-page">
      <div className="players-header">
        <h1>Club Roster</h1>
        <p className="players-subtitle">Manage your saved roster here, then build balanced teams in one click.</p>
        <div className="roster-actions">
          <button className="primary-button" onClick={() => setIsImportOpen((prev) => !prev)}>
            {isImportOpen ? 'Close Import' : playerData ? 'Update Roster' : 'Import Players'}
          </button>
          <button className="secondary-button" onClick={() => navigate(PATH.CREATE_TEAMS_PATH)} disabled={!playerData || playerData.players.length < 2}>
            Build Teams
          </button>
        </div>
      </div>

      {isImportOpen && (
        <div className="import-panel">
          <PlayersImport
            playersData={playerData?.players ?? []}
            setPlayersData={(players) => {
              setUserPlayers(players);
            }}
            onPlayerDataReady={(nextData) => setPlayerData(nextData)}
            persistImportedPlayers
            allowedInputTypes={['manual', 'spreadsheet', 'dynamic insert']}
            primaryActionLabel="Save To Roster"
          />
        </div>
      )}

      {!playerData ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Players Imported</h3>
          <p>Use the Import Players action above to create your roster, then open Team Builder.</p>
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
              {sortedPlayers.map((player, index) => (
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
