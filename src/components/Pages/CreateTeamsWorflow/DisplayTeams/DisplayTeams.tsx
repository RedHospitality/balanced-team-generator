import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faShareFromSquare, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import './DisplayTeams.css';

interface DisplayTeamsProps {
    errorMessage: string | undefined,
    teams: string[][],
    onBack: () => void,
    onRegenerate?: () => void,
}

const DisplayTeams: React.FC<DisplayTeamsProps> = ({ errorMessage, teams, onBack, onRegenerate }) => {

    const handleShare = async () => {
        const teamsText = teams
            .map((team, index) => `Team ${index + 1}\n${team.map(player => player.split(":")[0]).join('\n')}`)
            .join('\n\n');
        try {
            // Trigger the native sharing dialog
            if (navigator.share) {
                await navigator.share({
                    title: 'Generated Teams',
                    text: teamsText,
                });
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(teamsText);
                alert('Teams data copied to clipboard! Paste it to share.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleCopy = async () => {
        const teamsText = teams
            .map((team, index) => `Team ${index + 1}\n${team.map(player => player.split(":")[0]).join('\n')}`)
            .join('\n\n');
        try {
            await navigator.clipboard.writeText(teamsText);
            alert('Teams copied to clipboard!');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = teamsText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Teams copied to clipboard!');
        }
    };

    return (
        <div className='team-display-container'>
            <h2>Team Display</h2>

            {teams && !errorMessage &&
                <div className="team-container">
                    <h2><strong>Generated Teams</strong></h2>
                    {teams.map((team, index) => (
                        <div key={index} className="team">
                            <p><strong>Team {index + 1}:</strong></p>
                            <ul>
                                {team.map((player, playerIndex) => (
                                    <li key={playerIndex}>{player}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <p><strong>Not happy with the teams?</strong> Try generating new ones!</p>
                    <div className="button-group">
                        <button className="display-share-btn" onClick={handleShare} aria-label="Share teams">
                            <FontAwesomeIcon icon={faShareFromSquare as IconProp} />
                            {" Share"}
                        </button>
                        <button className="display-copy-btn" onClick={handleCopy} aria-label="Copy teams to clipboard">
                            <FontAwesomeIcon icon={faCopy as IconProp} />
                            {" Copy"}
                        </button>
                        {onRegenerate && (
                            <button className="display-regenerate-btn" onClick={onRegenerate} aria-label="Generate new teams">
                                Generate New Teams
                            </button>
                        )}
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
