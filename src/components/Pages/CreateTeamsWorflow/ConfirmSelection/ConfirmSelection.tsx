import React, { useState } from 'react';
import './ConfirmSelection.css';
import { PlayerModel } from '../Models/CreateTeamsModels';
import { allocatePlayersToTeams, shuffleArray } from '../../../../utils/teamUtils';

interface ConfirmSelectionProps {
    setErrorMessage: (message: string | undefined) => void,
    setTeams: React.Dispatch<React.SetStateAction<string[][]>>
    selectedPlayers: PlayerModel[],
    teamCount: number,
    onNext: () => void,
    onBack: () => void,
}

const ConfirmSelection: React.FC<ConfirmSelectionProps> = ({ setErrorMessage, setTeams, selectedPlayers, teamCount, onNext, onBack }) => {
    const handleGenerateTeams = (event: React.FormEvent) => {
        event.preventDefault();

        // Validate input
        if (selectedPlayers?.length < teamCount) {
            setErrorMessage("CANNOT PROCESS INVALID DATA");
            return;
        }

        try {
            // Use modular allocation logic: groups by rating, assigns to lightest team
            const generatedTeams = allocatePlayersToTeams(selectedPlayers, teamCount);
            
            // Shuffle team order for variety (teams are not ranked)
            shuffleArray(generatedTeams);
            
            setTeams(generatedTeams);
            setErrorMessage(undefined);
            onNext();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Error generating teams");
        }
    };

    return (
        <div className='confirmation-container'>
            <h2>Review Selection</h2>
            <h3>Players Playing:</h3>
            <ul>
                {selectedPlayers.map((player, index) => (
                    <li key={index}>{player.name} - {player.rating}</li>
                ))}
            </ul>
            <h2>Number of Teams: {teamCount}</h2>
            <div className='btn-div'>
                <button onClick={onBack}>Back</button>
                <button onClick={handleGenerateTeams}>Generate Teams</button>
            </div>
        </div>
    );
};

export default ConfirmSelection;
