import React, { useContext, useEffect, useMemo, useState } from 'react';
import './CreateTeamsWorkflow.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
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

interface WorkflowStep {
    title: string;
    hint: string;
}

const CreateTeamsWorkflow = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
    const [buildMode, setBuildMode] = useState<BuildMode>(null);
    const [playersData, setPlayersData] = useState<PlayerModel[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<PlayerModel[]>([]);
    const [teams, setTeams] = useState<TeamModel[]>([]);
    const [teamCount, setTeamCount] = useState<number>(2);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const { currentUserId, isGuestMode } = useContext(UserContext);

    const stepLabels = useMemo<WorkflowStep[]>(() => ([
        { title: 'Draft Source', hint: 'Choose roster source' },
        { title: 'Player Pool', hint: 'Pick your lineup' },
        { title: 'Lock Picks', hint: 'Tune final ratings' },
        { title: 'Team Reveal', hint: 'Review final teams' },
    ]), []);

    useEffect(() => {
        if (isGuestMode) {
            setBuildMode('external');
        }
    }, [isGuestMode]);


    const handleNext = () => {
        if (activeStep < 4) {
            setTransitionDirection('forward');
            setActiveStep(activeStep + 1);
        }
    };

    const handleBack = () => {
        if (activeStep > 1) {
            setTransitionDirection('backward');
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
        setTransitionDirection('forward');
        setActiveStep(2);
    };

    const handleChooseExternal = () => {
        setBuildMode('external');
        setPlayersData([]);
        setSelectedPlayers([]);
        setTeams([]);
        setErrorMessage(undefined);
    };

    const handleStepDotClick = (targetStep: number) => {
        if (targetStep < 1 || targetStep > stepLabels.length) {
            return;
        }

        // Keep forward progression gated by form completion, allow navigating back freely.
        if (targetStep > activeStep) {
            return;
        }

        setTransitionDirection(targetStep < activeStep ? 'backward' : 'forward');
        setActiveStep(targetStep);
    };

    return (
        <div className="create-teams-workflow">
            <div className="workflow-headline">
                <h2>Draft Room</h2>
                <p>Progress left to right: source your roster, lock your picks, then reveal balanced teams.</p>
            </div>
            <div className="step-meta" aria-live="polite">
                <span className="step-badge">Step {activeStep} / {stepLabels.length}</span>
                <h3>{stepLabels[activeStep - 1].title}</h3>
                <p>{stepLabels[activeStep - 1].hint}</p>
            </div>

            <div className="workflow-dots" aria-label="Draft step progress" role="list">
                {stepLabels.slice(0, 5).map((step, index) => {
                    const stepNumber = index + 1;
                    const isDone = activeStep > stepNumber;
                    const isActive = activeStep === stepNumber;
                    const isClickable = stepNumber <= activeStep;
                    return (
                        <button
                            key={step.title}
                            type="button"
                            className="workflow-dot-button"
                            role="listitem"
                            aria-label={`Go to step ${stepNumber}: ${step.title}`}
                            aria-current={isActive ? 'step' : undefined}
                            onClick={() => handleStepDotClick(stepNumber)}
                            disabled={!isClickable}
                            title={isClickable ? `Step ${stepNumber}: ${step.title}` : `Complete current step to unlock ${step.title}`}
                        >
                            <FontAwesomeIcon
                                icon={(isActive ? faSolidCircle : isDone ? faCheckCircle : faRegularCircle) as IconProp}
                                className={`workflow-dot ${isActive ? 'active' : isDone ? 'done' : ''}`}
                            />
                        </button>
                    );
                })}
            </div>

            <div className="workflow-rail" role="list" aria-label="Draft steps overview">
                {stepLabels.map((step, index) => {
                    const stepNumber = index + 1;
                    const isDone = activeStep > stepNumber;
                    const isActive = activeStep === stepNumber;
                    return (
                        <React.Fragment key={step.title}>
                            <div
                                className={`rail-step ${isActive ? 'active' : isDone ? 'done' : ''}`}
                                role="listitem"
                            >
                                {step.title}
                            </div>
                            {index < stepLabels.length - 1 && (
                                <span className="rail-arrow" aria-hidden="true">
                                    <FontAwesomeIcon icon={faChevronRight as IconProp} />
                                </span>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className={`workflow-content workflow-content-${transitionDirection}`} key={activeStep} id={`step-panel-${activeStep}`}>
                <div className="workflow-stage-card">
                    {activeStep === 1 && (
                        <div className="source-step">
                            <div className="mode-grid" role="group" aria-label="Select draft source">
                                {!isGuestMode && (
                                    <button type="button" className="source-card" onClick={() => void handleChooseSavedRoster()}>
                                        <h3>Saved Draft Board</h3>
                                        <p>Pull your saved dashboard roster and jump straight into selection.</p>
                                    </button>
                                )}
                                <button type="button" className="source-card" onClick={handleChooseExternal}>
                                    <h3>{isGuestMode ? 'Guest Import Round' : 'Quick Import Round'}</h3>
                                    <p>{isGuestMode ? 'Import or manually add players for this guest session and continue.' : 'Bring in players just for this draft session. Saved roster stays untouched.'}</p>
                                </button>
                            </div>

                            {buildMode === 'external' && (
                                <div className="external-import-wrap">
                                    <PlayersImport
                                        playersData={playersData}
                                        setPlayersData={setPlayersData}
                                        onNext={handleNext}
                                        persistImportedPlayers={isGuestMode}
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
        </div>
    );
};

export default CreateTeamsWorkflow;
