import React, { useContext, useState } from 'react';
import './PlayersImport.css';
import { PlayerModel } from '../Models/CreateTeamsModels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { UserContext } from '../../../../App';
import { normalizeRating } from '../../../../utils/teamUtils';
import { normalizeGoogleSheetsUrl, normalizeUrlWithError } from '../../../../utils/urlUtils';

interface PlayersImportProps {
  playersData: PlayerModel[],
  setPlayersData: (players: PlayerModel[]) => void,
  onNext: () => void,
}

const PlayersImport: React.FC<PlayersImportProps> = ({ playersData, setPlayersData, onNext }) => {
  const [dataInputType, setDataInputType] = useState<'manual' | 'url' | 'user' | 'dynamic insert'>('url');
  const [manualData, setManualData] = useState<string>('');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>('');
  const [dynamicPlayers, setDynamicPlayers] = useState<PlayerModel[]>([{ name: '', rating: 1 }]);
  const [importError, setImportError] = useState<string | undefined>(undefined);
  const userPlayers = useContext(UserContext).userPlayers;

  const fetchDataFromUrl = async (url: string): Promise<string> => {
    // Normalize the URL to standard CSV export format
    const normalizedUrl = normalizeGoogleSheetsUrl(url);
    if (!normalizedUrl) {
      throw new Error(
        'Invalid Google Sheets URL. Please ensure the URL is in format: ' +
        'https://docs.google.com/spreadsheets/d/{ID}/edit or paste the spreadsheet ID directly.'
      );
    }

    console.log('Fetching from normalized URL:', normalizedUrl);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(normalizedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error(
          `Failed to fetch sheet (HTTP ${response.status}). Ensure the sheet is publicly accessible (set to "Anyone with link can view").`
        );
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
      setPlayersData(userPlayers);
    }
  }, [dataInputType]);

  const handleProcessData = async () => {
    try {
      setImportError(undefined);
      let processedPlayers: PlayerModel[] = [];

      if (dataInputType === 'url') {
        const dataToProcess = await fetchDataFromUrl(spreadsheetUrl);
        processedPlayers = processDataToDisplay(dataToProcess, ',');
      } else if (dataInputType === 'manual') {
        processedPlayers = processDataToDisplay(manualData, ':');
      } else if (dataInputType === 'dynamic insert') {
        processedPlayers = [...dynamicPlayers.filter(player => player.name && player.rating)];
      } else {
        processedPlayers = userPlayers;
      }

      // Validate minimum player count
      if (processedPlayers.length < 2) {
        setImportError('Please import at least 2 players to form teams.');
        return;
      }

      setPlayersData(processedPlayers);
      onNext();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred while importing players.';
      setImportError(errorMessage);
      console.error('Error processing data:', error);
    }
  };

  const disableProcessButton = () => {
    if (dataInputType === 'url') {
      return !spreadsheetUrl;
    }
    else if (dataInputType === 'manual') {
      return !manualData;
    }
    else if (dataInputType === 'dynamic insert') {
      const allPlayers = [...dynamicPlayers.filter(player => player.name && player.rating)];
      return allPlayers.length < 2;
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
            onChange={(e) => setDataInputType(e.target.value as 'manual' | 'url' | 'user' | 'dynamic insert')}
            aria-label="Select data import method"
          >
            <option value="manual">Manual Input</option>
            <option value="url">Google Spreadsheet URL</option>
            <option value="user">Use My Players</option>
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

          {dataInputType === 'url' && (
            <div>
              <h4>Google Spreadsheet</h4>
              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                <strong>📋 Data Format:</strong> CSV with two columns: Name and Rating (1-10 whole numbers)<br/>
                <strong>🔗 Accepted URL Formats:</strong> We support ALL Google Sheets URL formats:<br/>
                &nbsp;&nbsp;• Share link: <code>https://docs.google.com/spreadsheets/d/{'{'}ID{'}'}/edit?usp=sharing</code><br/>
                &nbsp;&nbsp;• Edit link: <code>https://docs.google.com/spreadsheets/d/{'{'}ID{'}'}/edit</code><br/>
                &nbsp;&nbsp;• Mobile/iPad links<br/>
                &nbsp;&nbsp;• Just paste the ID: <code>{'{'}ID{'}'}</code><br/>
                <strong>🔐 Permission:</strong> Sheet must be set to <strong>"Anyone with the link can view"</strong> (open sharing settings)<br/>
                <strong>💡 Tip:</strong> Copy the link directly from Google Sheets share button - we'll auto-detect the format!
              </p>
              <label htmlFor="spreadsheet-url-input" style={{ display: 'block', marginBottom: '8px' }}>
                Google Sheets URL or Spreadsheet ID
              </label>
              <input
                id="spreadsheet-url-input"
                type="text"
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
                placeholder="Paste any Google Sheets link here..."
                aria-label="Google Sheets URL or spreadsheet ID"
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
