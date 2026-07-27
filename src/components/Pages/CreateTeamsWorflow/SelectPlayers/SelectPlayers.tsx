import React, { useState, useEffect, useContext, useMemo } from 'react';
import './SelectPlayers.css';
import { PlayerModel } from '../Models/CreateTeamsModels';
import { UserContext } from '../../../../App';
import { getUserPlayers, PlayerData } from '../../../../utils/authStorageUtils';

interface SelectPlayersProps {
    playersData: PlayerModel[],
    errorMessage: string | undefined,
    setErrorMessage: (message: string | undefined) => void,
    selectedPlayers: PlayerModel[],
    setSelectedPlayers: React.Dispatch<React.SetStateAction<PlayerModel[]>>,
    teamCount: number,
    setTeamCount: React.Dispatch<React.SetStateAction<number>>,
    onNext: () => void,
    onBack: () => void,
}

const SelectPlayers: React.FC<SelectPlayersProps> = ({ playersData, errorMessage, setErrorMessage, selectedPlayers,
    setSelectedPlayers, teamCount, setTeamCount, onBack, onNext }) => {
    const { currentUserId } = useContext(UserContext);
    const sortedPlayers = useMemo(() => (
        [...playersData].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    ), [playersData]);
    const initSelectAll = selectedPlayers ? selectedPlayers.length === playersData.length ? 'Yes' : 'Some' : 'No';
    const [selectAll, setSelectAll] = useState<string>(initSelectAll);
    const [storedData, setStoredData] = useState<PlayerData | null>(null);

    // Function to handle checkbox change
    const handleCheckboxChange = (player: PlayerModel) => {
        if (player.name === 'Select All') {
            // Toggle selectAll state
            setSelectAll(selectAll === 'Yes' ? 'No' : 'Yes');
        } else {
            // Update selectedPlayers based on player selection
            setSelectedPlayers(prevSelectedPlayers => {
                const isPlayerSelected = prevSelectedPlayers.includes(player);
                if (isPlayerSelected) {
                    return prevSelectedPlayers.filter(prevPlayer => prevPlayer !== player);
                } else {
                    return [...prevSelectedPlayers, player];
                }
            });
        }
    };

    // Update selectAll state based on selectedPlayers
    useEffect(() => {
        if (selectedPlayers.length === sortedPlayers.length && sortedPlayers.length > 0) {
            setSelectAll('Yes');
        } else if (selectedPlayers.length > 0) {
            setSelectAll('Some');
        } else {
            setSelectAll('No');
        }
    }, [selectedPlayers, sortedPlayers]);

    // Update selectedPlayers based on selectAll state
    useEffect(() => {
        if (selectAll === 'Yes') {
            setSelectedPlayers(sortedPlayers);
        } else if (selectAll === 'No') {
            setSelectedPlayers([]);
        }
    }, [selectAll, sortedPlayers, setSelectedPlayers]);

    useEffect(() => {
        const loadStoredData = async () => {
            if (!currentUserId) {
                setStoredData(null);
                return;
            }

            const data = await getUserPlayers(currentUserId);
            setStoredData(data);
        };

        void loadStoredData();
    }, [currentUserId]);

    // Function to handle team count change
    const handleTeamCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const count = parseInt(event.target.value, 10);
        setTeamCount(count > 0 ? count : 0);
    };

    // Function to handle confirmation of player selection
    const handleConfirmSelection = (event: React.FormEvent) => {
        event.preventDefault();

        if (selectedPlayers.length >= teamCount) {
            setErrorMessage(undefined);
            onNext();
        } else {
            setErrorMessage("CANNOT PROCESS INVALID DATA");
        }
    };

    return (
        <div className='team-selection-container'>
            <h2>Team Selection</h2>
            {storedData ? (
                <div style={{ textAlign: 'center', marginBottom: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                    <strong>Total Players Imported: {storedData.players.length}</strong>
                    <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                        (Import Type: {storedData.importType})
                    </span>
                </div>
            ) : null}
            <div className="sub-container">
                <h3>Player List</h3>
                <form onSubmit={handleConfirmSelection} className="form">
                    <div key="Select All" className="player-item">
                        <input
                            type="checkbox"
                            checked={selectAll === 'Yes'}
                            onChange={() => handleCheckboxChange({ name: 'Select All', rating: 0 })}
                        />
                        <p><b>Select All</b></p>
                        <hr className="separator" />
                    </div>
                    {sortedPlayers.map((player) => (
                        <div key={player.name} className="player-item">
                            <input
                                type="checkbox"
                                checked={selectedPlayers.includes(player)}
                                onChange={() => handleCheckboxChange(player)}
                            />
                            <div className="player-row-copy">
                                <p><b>{player.name + ": " + player.rating}</b></p>
                                <div className="player-attributes-inline">
                                    {player.attributes?.net && <span className="attribute-chip-inline">Net</span>}
                                    {player.attributes?.shooter && <span className="attribute-chip-inline">Shooter</span>}
                                </div>
                            </div>
                            <hr className="separator" />
                        </div>
                    ))}
                    <p>
                      Player Count: {selectedPlayers.length}
                    </p>
                    <label className="team-count-label" htmlFor="team-count-slider">
                        Team Count:
                        <input
                            id="team-count-slider"
                            type="range"
                            value={teamCount}
                            onChange={handleTeamCountChange}
                            min="1"
                            max={selectedPlayers.length || 1}
                            step="1"
                            className="team-count-slider"
                            aria-label="Number of teams"
                        />
                        <span className="team-count-value" aria-live="polite">{teamCount}</span>
                    </label>
                    <div className="select-actions">
                    <button className="generate-teams-button" onClick={onBack} aria-label="Go back to import players">
                        Back
                    </button>
                    <button type="submit" className="generate-teams-button" disabled={selectedPlayers.length < 2} aria-label="Confirm player selection">
                        Next
                    </button>
                    </div>
                </form>
            </div>
            {/* {!errorMessage && <label htmlFor="teamCount">Number of Teams: {teamCount} & Players: {selectedPlayers.length}</label>} */}
            
        </div>
    );
};

export default SelectPlayers;
