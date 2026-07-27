import React, { useContext, useMemo, useState } from 'react';
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
import { UserContext } from '../../../App';
import { getUserPlayers } from '../../../utils/authStorageUtils';

type BuildMode = 'saved' | 'external' | null;

const CreateTeamsWorkflow = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [buildMode, setBuildMode] = useState<BuildMode>(null);
    const [playersData, setPlayersData] = useState<PlayerModel[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<PlayerModel[]>([]);
    const [teams, setTeams] = useState<TeamModel[]>([]);
    const [teamCount, setTeamCount] = useState<number>(2);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const { currentUserId } = useContext(UserContext);

    const stepLabels = useMemo(() => ['Source', 'Select', 'Confirm', 'Teams'], []);


    const handleNext = () => {
        if (activeStep < 4) {
            setActiveStep(activeStep + 1);
        }
    };

    const handleBack = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
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

    const handleChooseSavedRoster = async () => {
        if (!currentUserId) {
            setErrorMessage('Please log in again to load your saved roster.');
            return;
        }

        const storedData = await getUserPlayers(currentUserId);
        if (!storedData || storedData.players.length < 2) {
            setErrorMessage('You need at least 2 saved players. Import players on Dashboard first.');
            return;
        }

        setBuildMode('saved');
        setPlayersData(storedData.players);
        setSelectedPlayers([]);
        setTeams([]);
        setErrorMessage(undefined);
        setActiveStep(2);
    };

    const handleChooseExternal = () => {
        setBuildMode('external');
        setPlayersData([]);
        setSelectedPlayers([]);
        setTeams([]);
        setErrorMessage(undefined);
    };

    return (
        <div className="create-teams-workflow">
            <div className="workflow-headline">
                <h2>Build Balanced Teams</h2>
                <p>Choose your source, select players, then generate fair teams.</p>
            </div>
            <div className="tabs" role="tablist" aria-label="Team builder steps">
                {stepLabels.map((label, index) => {
                    const stepNumber = index + 1;
                    const isDone = activeStep > stepNumber;
                    const isActive = activeStep === stepNumber;
                    return (
                        <button
                            key={label}
                            className={`tab ${isActive ? 'active' : isDone ? 'done' : ''}`}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`step-panel-${stepNumber}`}
                            onClick={() => setActiveStep(stepNumber)}
                        >
                            <FontAwesomeIcon
                                icon={(isActive ? faSolidCircle : isDone ? faCheckCircle : faRegularCircle) as IconProp}
                                className="dot-icon"
                            />
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="content" id={`step-panel-${activeStep}`}>
                {activeStep === 1 && (
                    <div className="source-step">
                        <div className="mode-grid">
                            <button type="button" className="source-card" onClick={() => void handleChooseSavedRoster()}>
                                <h3>Use My Players</h3>
                                <p>Load your saved dashboard roster and continue instantly.</p>
                            </button>
                            <button type="button" className="source-card" onClick={handleChooseExternal}>
                                <h3>One-Time External Import</h3>
                                <p>Import for this session only. Your saved roster stays unchanged.</p>
                            </button>
                        </div>

                        {buildMode === 'external' && (
                            <div className="external-import-wrap">
                                <PlayersImport
                                    playersData={playersData}
                                    setPlayersData={setPlayersData}
                                    onNext={handleNext}
                                    persistImportedPlayers={false}
                                    allowedInputTypes={['manual', 'spreadsheet', 'dynamic insert']}
                                    primaryActionLabel="Continue"
                                />
                            </div>
                        )}

                        {errorMessage && <p className="workflow-error" role="alert">{errorMessage}</p>}
                    </div>
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
