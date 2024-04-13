import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface DisplayTeamsProps {
    errorMessage: string | undefined,
    teams: string[][],
}

const DisplayTeams: React.FC<DisplayTeamsProps> = ({ errorMessage, teams }) => {

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
                // Deprecated way to copy to clipboard document.execCommand('copy'); that uses useRef.select() to hidden <textarea>
                // New way Using the Clipboard API to copy the selected text
                await navigator.clipboard.writeText(teamsText);
                alert('Teams data copied to clipboard! Paste it to share.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div>
            <h2>Team Display</h2>

            {teams && !errorMessage &&
                <div className="team-container">
                    <h2>Teams</h2>
                    {teams.map((team, index) => (
                        <div key={index} className="team">
                            <p>Team {index + 1}:</p>
                            <ul>
                                {team.map((player, playerIndex) => (
                                    <li key={playerIndex}>{player}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <button className="share-btn" onClick={handleShare}>
                        <FontAwesomeIcon icon={faShare as IconProp} />
                    </button>
                </div>
            }

        </div>
    );
};

export default DisplayTeams;
