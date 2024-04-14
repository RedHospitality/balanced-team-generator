import React, { useState, useEffect } from 'react';
import { PlayerModel } from '../Models/CreateTeamsModels';

interface SelectPlayersProps {
    playersData: PlayerModel[];
    errorMessage: string | undefined,
    setErrorMessage: (message: string | undefined) => void;
    selectedPlayers: PlayerModel[];
    setSelectedPlayers: React.Dispatch<React.SetStateAction<PlayerModel[]>>;
    teamCount: number;
    setTeamCount: React.Dispatch<React.SetStateAction<number>>;
}

const SelectPlayers: React.FC<SelectPlayersProps> = ({ playersData, errorMessage, setErrorMessage, selectedPlayers,
    setSelectedPlayers, teamCount, setTeamCount }) => {
    const [numberOfTeams, setNumberOfTeams] = useState(2);
    const initSelectAll = selectedPlayers? selectedPlayers.length === playersData.length? 'Yes': 'Some': 'No';
    const [selectAll, setSelectAll] = useState<string>(initSelectAll);

    // Function to handle checkbox change
    const handleCheckboxChange = (player: PlayerModel) => {
        if (player.name === 'Select All') {
            // Toggle selectAll state
            setSelectAll(selectAll == 'Yes'? 'No': 'Yes');
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
        if (selectedPlayers.length === playersData.length) {
            setSelectAll('Yes');
        } else if (selectedPlayers.length > 0){
            setSelectAll('Some');
        }
        else{
          setSelectAll('No');
        }
    }, [selectedPlayers, playersData]);

    // Update selectedPlayers based on selectAll state
    useEffect(() => {
        if (selectAll === 'Yes') {
            setSelectedPlayers(playersData);
        } else if(selectAll === 'No'){
            setSelectedPlayers([]);
        }
    }, [selectAll]);

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
        } else {
            setErrorMessage("CANNOT PROCESS INVALID DATA");
        }
    };

    return (
        <div>
            <h2>Team Selection</h2>
            <div className="container">
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
                    {playersData.map((player) => (
                        <div key={player.name} className="player-item">
                            <input
                                type="checkbox"
                                checked={selectedPlayers.includes(player)}
                                onChange={() => handleCheckboxChange(player)}
                            />
                            <p><b>{player.name + ": " + player.rating}</b></p>
                            <hr className="separator" />
                        </div>
                    ))}
                    <label className="team-count-label">
                        Team Count:
                        <input
                            type="range"
                            value={teamCount}
                            onChange={handleTeamCountChange}
                            min="2"
                            max="20"
                            step="1"
                            className="team-count-slider"
                        />
                        <span className="team-count-value">{teamCount}</span>
                    </label>
                    <button type="submit" className="generate-teams-button" disabled={selectedPlayers.length < 2}>
                        Confirm Selection
                    </button>
                </form>
            </div>
            {!errorMessage && <label htmlFor="teamCount">Number of Teams: {teamCount} & Players: {selectedPlayers.length}</label>}
            
        </div>
    );
};

export default SelectPlayers;
