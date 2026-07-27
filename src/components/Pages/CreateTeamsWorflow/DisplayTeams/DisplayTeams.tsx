import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faShareFromSquare, faCopy, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { TeamModel } from '../Models/CreateTeamsModels';
import './DisplayTeams.css';

interface DisplayTeamsProps {
    errorMessage: string | undefined,
    teams: TeamModel[],
    onBack: () => void,
    onRegenerate?: () => void,
}

const DisplayTeams: React.FC<DisplayTeamsProps> = ({ errorMessage, teams, onBack, onRegenerate }) => {
    const [copiedMessage, setCopiedMessage] = React.useState<string | null>(null);

    const buildTeamsText = () => teams
        .map((team, index) => {
            const playerList = team.players
                .map((player, playerIndex) => `${playerIndex + 1}. ${player.name}`)
                .join('\n');
            return `Team ${index + 1} (Avg Rating: ${(team.totalRating / team.players.length).toFixed(2)})\n${playerList}`;
        })
        .join('\n\n');

    const handleShare = async () => {
        const teamsText = buildTeamsText();
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Generated Teams',
                    text: teamsText,
                });
            } else {
                await navigator.clipboard.writeText(teamsText);
                setCopiedMessage('Teams copied to clipboard.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleCopy = async () => {
        const teamsText = buildTeamsText();
        try {
            await navigator.clipboard.writeText(teamsText);
            setCopiedMessage('Teams copied to clipboard.');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            const textArea = document.createElement('textarea');
            textArea.value = teamsText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedMessage('Teams copied to clipboard.');
        }
    };

    return (
        <div className='team-display-container'>
            <h2>Team Display</h2>

            {errorMessage && (
                <div style={{ color: '#d32f2f', marginBottom: '15px', padding: '12px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                    <strong>⚠️ Error:</strong> {errorMessage}
                </div>
            )}

            {teams && !errorMessage &&
                <div className="team-container">
                    <div className="teams-header">
                        <h2><strong>Generated Teams</strong></h2>
                        {onRegenerate && (
                            <button 
                                className="refresh-btn" 
                                onClick={onRegenerate} 
                                aria-label="Generate new teams"
                                title="Regenerate Team"
                            >
                                <FontAwesomeIcon icon={faRefresh as IconProp} />
                            </button>
                        )}
                    </div>
                    <div className='teams-render'>
                        {teams.map((team, index) => (
                            <div key={index} className="team">
                                <p><strong>Team {index + 1}:</strong> <span className="avg-rating">Avg Rating: {(team.totalRating / team.players.length).toFixed(2)}</span></p>
                                <ul>
                                    {team.players.map((player, playerIndex) => (
                                        <li key={playerIndex}>{playerIndex + 1}. {player.name}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="copy-button-float" 
                            onClick={handleCopy} 
                            aria-label="Copy teams to clipboard"
                            title="Copy teams"
                        >
                            <FontAwesomeIcon icon={faCopy as IconProp} />
                        </button>
                    </div>
                    {copiedMessage && <p className="copied-message" role="status">{copiedMessage}</p>}
                    <p><strong>Not happy with the teams?</strong> Try generating new ones!</p>
                    <div className="button-group">
                        <button className="display-share-btn" onClick={handleShare} aria-label="Share teams">
                            <FontAwesomeIcon icon={faShareFromSquare as IconProp} />
                            {" Share"}
                        </button>
                        <button className="display-back-btn" onClick={onBack} aria-label="Go back to confirm selection">
                            Back
                        </button>
                    </div>
                </div>
            }

        </div>
    );
};

export default DisplayTeams;
