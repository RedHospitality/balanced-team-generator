import React, { useContext, useState } from 'react';
import './PlayersImport.css';
import { PlayerModel, PlayerData } from '../Models/CreateTeamsModels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { UserContext } from '../../../../App';
import { normalizeRating, normalizePlayers } from '../../../../utils/teamUtils';
import { normalizeGoogleSheetsUrl } from '../../../../utils/urlUtils';
import { storePlayerData, getPlayerData } from '../../../../utils/cookieUtils';

interface PlayersImportProps {
  playersData: PlayerModel[],
  setPlayersData: (players: PlayerModel[]) => void,
  onNext: () => void,
}

const PlayersImport: React.FC<PlayersImportProps> = ({ playersData, setPlayersData, onNext }) => {
  const [dataInputType, setDataInputType] = useState<'manual' | 'spreadsheet' | 'user' | 'dynamic insert'>('spreadsheet');
  const [manualData, setManualData] = useState<string>('');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>('');
  const [spreadsheetType, setSpreadsheetType] = useState<'google' | 'microsoft'>('google');
  const [dynamicPlayers, setDynamicPlayers] = useState<PlayerModel[]>([{ name: '', rating: 1 }]);
  const [importError, setImportError] = useState<string | undefined>(undefined);
  const userPlayers = useContext(UserContext).userPlayers;

  const fetchDataFromUrl = async (url: string, type: 'google' | 'microsoft'): Promise<string> => {
    let normalizedUrl: string | null = null;

    if (type === 'google') {
      normalizedUrl = normalizeGoogleSheetsUrl(url);
      if (!normalizedUrl) {
        throw new Error(
          'Invalid Google Sheets URL. Please ensure the URL is in format: ' +
          'https://docs.google.com/spreadsheets/d/{ID}/edit or paste the spreadsheet ID directly.'
        );
      }
    } else if (type === 'microsoft') {
      // For Microsoft Excel online, we need to handle different URL formats
      // This is a simplified version - you might need to expand this based on actual Microsoft API
      if (url.includes('onedrive.live.com') || url.includes('docs.microsoft.com')) {
        // Convert to CSV export URL - this might need adjustment based on actual Microsoft API
        normalizedUrl = url.replace('/edit', '/export?format=csv');
      } else {
        throw new Error('Invalid Microsoft Excel URL. Please provide a valid Excel Online sharing URL.');
      }
    }

    console.log('Fetching from normalized URL:', normalizedUrl);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(normalizedUrl!, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`HTTP Error: ${response.status} ${response.statusText}`);
        const errorMsg = type === 'google'
          ? `Failed to fetch sheet (HTTP ${response.status}). Ensure the sheet is publicly accessible ("Anyone with link can view").`
          : `Failed to fetch Excel file (HTTP ${response.status}). Ensure the file is publicly shared.`;
        throw new Error(errorMsg);
      }

      const data = await response.text();
      
      // Check if we got valid CSV data
      if (!data || data.trim().length === 0) {
        throw new Error('Sheet returned empty data. Check if the sheet has data and is accessible.');
      }
      
      // Check if we got an HTML error page instead of CSV
      if (data.includes('<html') || data.includes('<!DOCTYPE')) {
        throw new Error('Received HTML instead of CSV data. The sheet may not be publicly accessible or the URL may be incorrect.');
      }

      return data;
    } catch (err) {
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out after 10 seconds. The sheet may be unavailable or very slow.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = `Network error: ${err.message}. Check your internet connection and ensure the sheet is publicly shared ("Anyone with link can view").`;
        } else {
          errorMessage = err.message;
        }
      }
      
      console.error('Fetch error details:', err);
      throw new Error(errorMessage);
    }
  };

  const processDataToDisplay = (dataToProcess: string, delimiter: string) => {
    let displayData: PlayerModel[] = [];
    const lines = dataToProcess.split("\n").map(line => line.trim()).filter(line => line);

    lines.forEach((line, index) => {
      const parts = line.split(delimiter).map(part => part.trim());
      
      if (parts.length < 2) {
        return; // Skip malformed lines
      }

      const name = parts[0];
      const ratingStr = parts[1];
      const rating = parseFloat(ratingStr);

      // Skip header row: if this is first line and rating is non-numeric, skip it
      if (index === 0 && isNaN(rating)) {
        return;
      }

      // Only add if name is non-empty and rating is a valid number
      // normalizeRating will round to 1-10 whole number
      if (name && !isNaN(rating)) {
        displayData.push({ name, rating: normalizeRating(rating) });
      }
    });

    return displayData;
  }

  /*TODO: Remove, just populating dummy data for now. */
  React.useEffect(()=> {
    if(dataInputType === 'user'){
      const cookieData = getPlayerData();
      if (cookieData) {
        setPlayersData(cookieData.players);
      } else {
        // If no cookie data, reset to empty and maybe show error
        setPlayersData([]);
        setImportError('No saved player data found. Please import players first.');
      }
    }
  }, [dataInputType, setPlayersData]);

  const handleProcessData = async () => {
    try {
      setImportError(undefined);
      let processedPlayers: PlayerModel[] = [];
      let importType: 'Manual' | 'Dynamic Insert' | 'Spreadsheet' = 'Manual';
      let importUrl: string | undefined;

      if (dataInputType === 'spreadsheet') {
        const dataToProcess = await fetchDataFromUrl(spreadsheetUrl, spreadsheetType);
        processedPlayers = processDataToDisplay(dataToProcess, ',');
        importType = 'Spreadsheet';
        importUrl = spreadsheetUrl;
      } else if (dataInputType === 'manual') {
        processedPlayers = processDataToDisplay(manualData, ':');
        importType = 'Manual';
      } else if (dataInputType === 'user') {
        const cookieData = getPlayerData();
        if (cookieData) {
          processedPlayers = cookieData.players;
          importType = cookieData.importType;
          importUrl = cookieData.importUrl;
        } else {
          throw new Error('No saved player data found. Please import players first.');
        }
      } else {
        processedPlayers = userPlayers;
        importType = 'Manual'; // Default for user players
      }

      // Validate minimum player count
      if (processedPlayers.length < 2) {
        setImportError('Please import at least 2 players to form teams.');
        return;
      }

      // Normalize and deduplicate players, and only store valid entries
      const sanitizedPlayers = normalizePlayers(processedPlayers);

      // Store in cookies
      const playerData: PlayerData = {
        players: sanitizedPlayers,
        importType,
        importUrl
      };
      storePlayerData(playerData);

      setPlayersData(sanitizedPlayers);
      onNext();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred while importing players.';
      setImportError(errorMessage);
      console.error('Error processing data:', error);
    }
  };

  const disableProcessButton = () => {
    if (dataInputType === 'spreadsheet') {
      return !spreadsheetUrl;
    }
    else if (dataInputType === 'manual') {
      return !manualData;
    }
    else if (dataInputType === 'dynamic insert') {
      const allPlayers = [...dynamicPlayers.filter(player => player.name && player.rating)];
      return allPlayers.length < 2;
    }
    else if (dataInputType === 'user') {
      return !getPlayerData();
    }
    return undefined;
  }

  const handleAddPlayer = () => {
    setDynamicPlayers([...dynamicPlayers, { name: '', rating: 1 }]);
  };

  const handleRemovePlayer = (index: number) => {
    const updatedPlayers = [...dynamicPlayers];
    updatedPlayers.splice(index, 1);
    setDynamicPlayers(updatedPlayers);
  };

  const handleDynamicPlayerChange = (index: number, key: keyof PlayerModel, value: string) => {
    const updatedPlayers = dynamicPlayers.map((player, i) => {
      if (i === index) {
        return {
          ...player,
          [key]: value
        };
      }
      return player;
    });
    setDynamicPlayers(updatedPlayers);
  };

  const renderRatingOptions = () => {
    const options = [];
    for (let rating = 1; rating <= 10; rating++) {
      options.push(
        <option key={rating} value={rating}>
          {rating}
        </option>
      );
    }
    return options;
  };


  return (
    <div className='players-import-container'>
      <div className='import-data-content'>
        <h3>Choose Data Input Type</h3>
        <div>
        <div className="dropdown-container">
          <label htmlFor="import-type-select" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Data Import Method
          </label>
          <select
            id="import-type-select"
            className="dropdown-type-list"
            value={dataInputType}
            onChange={(e) => setDataInputType(e.target.value as 'manual' | 'spreadsheet' | 'user' | 'dynamic insert')}
            aria-label="Select data import method"
          >
            <option value="manual">Manual Input</option>
            <option value="spreadsheet">Spreadsheet URL</option>
            {getPlayerData() && <option value="user">Use My Players</option>}
            <option value="dynamic insert">Dynamic Insert</option>
          </select>
        </div>


          {dataInputType === 'manual' && (
            <div>
              <h4>Enter Players Information</h4>
              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                Format: PlayerName:Rating (ratings 1-10)
              </p>
              <label htmlFor="manual-input-textarea" style={{ display: 'block', marginBottom: '8px' }}>
                Players Data
              </label>
              <textarea
                id="manual-input-textarea"
                value={manualData}
                onChange={(e) => setManualData(e.target.value)}
                placeholder="Player1:7&#10;Player2:8&#10;Player3:5"
                aria-label="Enter player names and ratings"
              />
            </div>
          )}

          {dataInputType === 'spreadsheet' && (
            <div>
              <h4>Spreadsheet Import</h4>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Select Spreadsheet Type:
                </label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label>
                    <input
                      type="radio"
                      value="google"
                      checked={spreadsheetType === 'google'}
                      onChange={(e) => setSpreadsheetType(e.target.value as 'google' | 'microsoft')}
                    />
                    Google Sheets
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="microsoft"
                      checked={spreadsheetType === 'microsoft'}
                      onChange={(e) => setSpreadsheetType(e.target.value as 'google' | 'microsoft')}
                    />
                    Microsoft Excel
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Requirements:</strong>
                {spreadsheetType === 'google' ? (
                  <p style={{ fontSize: '0.9em', color: '#666', margin: '5px 0' }}>
                    • Sheet must be publicly accessible ("Anyone with the link can view")<br/>
                    • First column: Player names, Second column: Ratings (1-10)
                  </p>
                ) : (
                  <p style={{ fontSize: '0.9em', color: '#666', margin: '5px 0' }}>
                    • Excel file must be shared publicly<br/>
                    • First column: Player names, Second column: Ratings (1-10)
                  </p>
                )}
              </div>

              <label htmlFor="spreadsheet-url-input" style={{ display: 'block', marginBottom: '8px' }}>
                Spreadsheet URL
              </label>
              <input
                id="spreadsheet-url-input"
                type="text"
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
                placeholder="Paste your spreadsheet URL here..."
                aria-label="Spreadsheet URL"
              />
            </div>
          )}

          {dataInputType === 'user' && (
            <div>
              <h4>You have {userPlayers.length} players</h4>
              <p>Go to Players page to update ratings.</p>
            </div>
          )}

          {dataInputType === 'dynamic insert' && (
            <div>
              <h4>Dynamic Player Insertion</h4>
              {dynamicPlayers.map((player, index) => (
                <div className='dynamic-div' key={index}>
                  <input
                    type="text"
                    placeholder="Player Name"
                    value={player.name}
                    onChange={(e) => handleDynamicPlayerChange(index, 'name', e.target.value)}
                  />
                  <select
                    value={player.rating}
                    onChange={(e) => handleDynamicPlayerChange(index, 'rating', e.target.value)}
                  >
                    {renderRatingOptions()}
                  </select>
                  {index === dynamicPlayers.length - 1 && player.name && player.rating && (
                    <button className='add-minus-btn' onClick={handleAddPlayer} >
                      <FontAwesomeIcon icon={faPlus as IconProp} />
                    </button>
                  )}
                  {index !== dynamicPlayers.length - 1 && (
                    <button className='add-minus-btn' onClick={() => handleRemovePlayer(index)}>
                      <FontAwesomeIcon icon={faMinus as IconProp} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}


          {importError && (
            <div style={{ color: '#d32f2f', fontSize: '0.95em', marginBottom: '15px', padding: '12px', backgroundColor: '#ffebee', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              <strong>⚠️ Error:</strong> {importError}
            </div>
          )}

          <button className="process-btn" onClick={handleProcessData} disabled={disableProcessButton()}>Process</button>
        </div>
      </div>
      <p className="player-count">
        Click Process To Import Players
      </p>
    </div>
  );
};

export default PlayersImport;
