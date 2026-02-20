import React, { useState } from 'react';
import './CreateTeamsWorkflow.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircle as faSolidCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle as faRegularCircle } from '@fortawesome/free-regular-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import DisplayTeams from './DisplayTeams/DisplayTeams';
import SelectPlayers from './SelectPlayers/SelectPlayers';
import ConfirmSelection from './ConfirmSelection/ConfirmSelection';
import PlayersImport from './PlayersImport/PlayersImport';
import { PlayerModel, TeamModel } from './Models/CreateTeamsModels';
import { allocatePlayersToTeams } from '../../../utils/teamUtils';

const CreateTeamsWorkflow = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [taskCompleted, setTaskCompleted] = useState(false);
    const [playersData, setPlayersData] = useState<PlayerModel[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<PlayerModel[]>([]);
    const [teams, setTeams] = useState<TeamModel[]>([]);
    const [teamCount, setTeamCount] = useState<number>(2);
    const [errorMessage, setErrorMessage] = useState<string | undefined>("No Selected Players");


    const handleNext = () => {
        if (activeStep < 4) {
            setActiveStep(activeStep + 1);
            setTaskCompleted(false);
        }
    };

    const handleBack = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
            setTaskCompleted(false);
        }
    };

    const handleRegenerate = () => {
        // Regenerate teams in place without navigating
        try {
            const generatedTeams = allocatePlayersToTeams(selectedPlayers, teamCount);
            setTeams(generatedTeams);
            setErrorMessage(undefined);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Error regenerating teams");
        }
    };

    return (
        <div className="create-teams-workflow">
            <div className="tabs">
                <div className={`tab ${activeStep === 1 ? 'active' : activeStep > 1? 'done':''}`} onClick={() => setActiveStep(1)}>
                    <FontAwesomeIcon icon={(activeStep == 1 ? faSolidCircle : faCheckCircle) as IconProp} 
                        className="dot-icon" />
                </div>
                <div className={`tab ${activeStep === 2 ? 'active' : activeStep > 2? 'done':''}`} onClick={() => setActiveStep(2)}>
                    <FontAwesomeIcon icon={(activeStep == 2 ? faSolidCircle : activeStep < 2 ? faRegularCircle : faCheckCircle) as IconProp} 
                        className="dot-icon" />
                </div>
                <div className={`tab ${activeStep === 3 ? 'active' : activeStep > 3? 'done':''}`} onClick={() => setActiveStep(3)}>
                    <FontAwesomeIcon icon={(activeStep == 3 ? faSolidCircle : activeStep < 3 ? faRegularCircle : faCheckCircle) as IconProp} 
                        className="dot-icon" />
                </div>
                <div className={`tab ${activeStep === 4? 'active' : ''}`} onClick={() => setActiveStep(4)}>
                    <FontAwesomeIcon icon={(activeStep == 4 ? faSolidCircle : activeStep < 4 ? faRegularCircle : faCheckCircle) as IconProp} 
                        className="dot-icon" />
                </div>
            </div>

            <div className="content">
                {activeStep === 1 && (
                    <PlayersImport
                        playersData={playersData}
                        setPlayersData={setPlayersData}
                        onNext={handleNext}
                    />
                )}
                {activeStep === 2 && (
                    <SelectPlayers
                        playersData={playersData}
                        selectedPlayers={selectedPlayers}
                        setSelectedPlayers={setSelectedPlayers}
                        setErrorMessage={setErrorMessage}
                        setTeamCount={setTeamCount}
                        teamCount={teamCount}
                        errorMessage={errorMessage}
                        onBack={handleBack}
                        onNext={handleNext}
                    />
                )}
                {activeStep === 3 && (
                    <ConfirmSelection
                        setErrorMessage={setErrorMessage}
                        setTeams={setTeams}
                        selectedPlayers={selectedPlayers}
                        teamCount={teamCount}
                        onBack={handleBack}
                        onNext={handleNext}
                    />
                )}
                {activeStep === 4 && (
                    <DisplayTeams
                        errorMessage={errorMessage}
                        teams={teams}
                        onBack={handleBack}
                        onRegenerate={handleRegenerate}
                    />
                )}
            </div>
        </div>
    );
};

export default CreateTeamsWorkflow;
