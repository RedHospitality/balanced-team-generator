import React, { useState } from 'react';
import './ConfirmSelection.css';
import { PlayerModel, TeamModel } from '../Models/CreateTeamsModels';
import { allocatePlayersToTeams } from '../../../../utils/teamUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface ConfirmSelectionProps {
    setErrorMessage: (message: string | undefined) => void,
    setTeams: React.Dispatch<React.SetStateAction<TeamModel[]>>
    selectedPlayers: PlayerModel[],
    teamCount: number,
    onNext: () => void,
    onBack: () => void,
}

const ConfirmSelection: React.FC<ConfirmSelectionProps> = ({ setErrorMessage, setTeams, selectedPlayers, teamCount, onNext, onBack }) => {
    const [editedPlayers, setEditedPlayers] = useState<PlayerModel[]>(selectedPlayers.map(p => ({ ...p })));
    const [guestPlayers, setGuestPlayers] = useState<PlayerModel[]>([{ name: '', rating: 1 }]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const handleEditRating = (index: number, newRating: number) => {
        const updatedPlayers = editedPlayers.map((p, i) => 
            i === index ? { ...p, rating: newRating } : p
        );
        setEditedPlayers(updatedPlayers);
    };

    const handleGuestPlayerChange = (index: number, field: 'name' | 'rating', value: string | number) => {
        const updatedGuests = [...guestPlayers];
        updatedGuests[index] = {
            ...updatedGuests[index],
            [field]: value
        };
        setGuestPlayers(updatedGuests);
    };

    const handleAddGuestPlayer = () => {
        setGuestPlayers([...guestPlayers, { name: '', rating: 1 }]);
    };

    const handleRemoveGuestPlayer = (index: number) => {
        const updatedGuests = [...guestPlayers];
        updatedGuests.splice(index, 1);
        setGuestPlayers(updatedGuests);
    };

    const validatePlayers = (): boolean => {
        const errors: string[] = [];
        const allPlayers = [...editedPlayers, ...guestPlayers.filter(p => p.name.trim())];
        const playerNames = allPlayers.map(p => p.name.trim().toLowerCase());
        
        // Check for empty names in guest section
        guestPlayers.forEach((player, index) => {
            if (player.name.trim() && !player.rating) {
                errors.push(`Guest player ${index + 1}: Please set a rating`);
            }
        });
        
        // Check for duplicates
        const duplicates = playerNames.filter((name, index) => name && playerNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
            const uniqueDuplicates = Array.from(new Set(duplicates));
            errors.push(`Duplicate player names: ${uniqueDuplicates.join(', ')}`);
        }
        
        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleGenerateTeams = (event: React.FormEvent) => {
        event.preventDefault();

        // Validate
        if (!validatePlayers()) {
            return;
        }

        // Combine edited players with valid guest players (deep copy to avoid mutations)
        const validGuests = guestPlayers.filter(p => p.name.trim()).map(p => ({ ...p }));
        const finalPlayers = [...editedPlayers.map(p => ({ ...p })), ...validGuests];

        // Validate minimum
        if (finalPlayers.length < teamCount) {
            setErrorMessage("CANNOT PROCESS INVALID DATA - Not enough players for team count");
            return;
        }

        try {
            const generatedTeams = allocatePlayersToTeams(finalPlayers, teamCount);
            setTeams(generatedTeams);
            setErrorMessage(undefined);
            onNext();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Error generating teams");
        }
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

    const totalPlayers = editedPlayers.length + guestPlayers.filter(p => p.name.trim()).length;

    return (
        <div className='confirmation-container'>
            <h2>Review Selection</h2>
            
            <div className='temp-message'>
                <strong>Note:</strong> All changes below are temporary and only used for this team generation. Your imported data remains unchanged.
            </div>

            {validationErrors.length > 0 && (
                <div className='validation-errors'>
                    <strong>⚠️ Validation Errors:</strong>
                    <ul>
                        {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <h3>Imported Players (Adjust Ratings if needed):</h3>
            <div style={{ marginBottom: '20px' }}>
                {editedPlayers.map((player, index) => (
                    <div key={index} className='player-row'>
                        <span style={{ flex: 1, fontWeight: 'bold' }}>{player.name}</span>
                        <select 
                            value={player.rating}
                            onChange={(e) => handleEditRating(index, parseInt(e.target.value))}
                        >
                            {renderRatingOptions()}
                        </select>
                    </div>
                ))}
            </div>

            <h3>Guest Players (Optional - Add Last Minute Players):</h3>
            <div className='guest-players-section'>
                {guestPlayers.map((player, index) => (
                    <div key={index} className='guest-row'>
                        <input
                            type="text"
                            placeholder="Guest player name"
                            value={player.name}
                            onChange={(e) => handleGuestPlayerChange(index, 'name', e.target.value)}
                        />
                        <select 
                            value={player.rating}
                            onChange={(e) => handleGuestPlayerChange(index, 'rating', parseInt(e.target.value))}
                        >
                            {renderRatingOptions()}
                        </select>
                        {index === guestPlayers.length - 1 && player.name && player.rating ? (
                            <button 
                                type="button"
                                onClick={handleAddGuestPlayer}
                                title="Add guest player"
                            >
                                <FontAwesomeIcon icon={faPlus as IconProp} />
                            </button>
                        ) : null}
                        {index !== guestPlayers.length - 1 ? (
                            <button 
                                type="button"
                                onClick={() => handleRemoveGuestPlayer(index)}
                                title="Remove guest player"
                            >
                                <FontAwesomeIcon icon={faMinus as IconProp} />
                            </button>
                        ) : null}
                    </div>
                ))}
            </div>

            <div className='total-players-box'>
                <strong>Total Players for Team Generation: {totalPlayers}</strong>
                <span style={{ marginLeft: '15px' }}>
                    (Teams: {teamCount})
                </span>
            </div>

            <div className='btn-div'>
                <button onClick={onBack}>Back</button>
                <button onClick={handleGenerateTeams}>Generate Teams</button>
            </div>
        </div>
    );
};

export default ConfirmSelection;
