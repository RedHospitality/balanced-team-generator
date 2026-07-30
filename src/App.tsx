import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './components/Home';
import Players from './components/Pages/Players/Players';
import './App.css';
import { PATH } from './constants/path';
import CreateTeamsWorkflow from './components/Pages/CreateTeamsWorflow/CreateTeamsWorkflow';
import LoginPage from './components/Pages/LoginPage/LoginPage';
import { PlayerModel } from './components/Pages/CreateTeamsWorflow/Models/CreateTeamsModels';
import { GUEST_USER_ID, getActiveUser, getUserPlayers } from './utils/authStorageUtils';

interface AppUserContext {
  userPlayers: PlayerModel[];
  setUserPlayers: React.Dispatch<React.SetStateAction<PlayerModel[]>>;
  currentUserId: string | null;
  isGuestMode: boolean;
}

export const UserContext = createContext<AppUserContext>({
  userPlayers: [],
  setUserPlayers: () => {},
  currentUserId: null,
  isGuestMode: false,
});

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [userPlayers, setUserPlayers] = useState<PlayerModel[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const isGuestMode = currentUserId === GUEST_USER_ID;

  const handleToggleSidebar = () => {
    setIsSidebarOpen((previous) => !previous);
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const activeUser = await getActiveUser();
        if (activeUser) {
          setIsLoggedIn(true);
          setCurrentUserId(activeUser.id);
          const storedPlayers = await getUserPlayers(activeUser.id);
          setUserPlayers(storedPlayers?.players ?? []);
        } else {
          setIsLoggedIn(false);
          setCurrentUserId(null);
          setUserPlayers([]);
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    void initializeSession();
  }, []);

  const handleLoginSuccess = async (userId: string | null) => {
    setIsLoggedIn(Boolean(userId));
    setCurrentUserId(userId);
    if (userId) {
      const storedPlayers = await getUserPlayers(userId);
      setUserPlayers(storedPlayers?.players ?? []);
    } else {
      setUserPlayers([]);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserId(null);
    setUserPlayers([]);
    setIsSidebarOpen(false);
  };

  return (
    <UserContext.Provider value={{ userPlayers, setUserPlayers, currentUserId, isGuestMode }}>
      <Router basename="/draft-master">
        <div className="App">
          {isLoggedIn && !isAuthLoading && (
            <div className={`${isSidebarOpen ? 'leftDisplay' : 'leftHide'}`}>
              <Sidebar isOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} onLogout={handleLogout} isGuestMode={isGuestMode} />
            </div>
          )}

          {isLoggedIn && isSidebarOpen && (
            <button
              className="sidebar-backdrop"
              type="button"
              aria-label="Close navigation menu"
              onClick={handleToggleSidebar}
            />
          )}

          <div className={`right ${isSidebarOpen && isLoggedIn ? '' : 'hide'}`}>
            <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} isLoggedIn={isLoggedIn} />
            <div className="content">
              {isAuthLoading ? (
                <div className="page-loading" role="status" aria-live="polite">Loading your workspace...</div>
              ) : (
                <Routes>
                  <Route path={PATH.BASE_PATH} element={isLoggedIn ? <Navigate to={isGuestMode ? PATH.CREATE_TEAMS_PATH : PATH.PLAYER_PATH} replace /> : <Navigate to={PATH.LOGIN_PATH} replace />} />
                  <Route path={PATH.LOGIN_PATH} element={isLoggedIn ? <Navigate to={isGuestMode ? PATH.CREATE_TEAMS_PATH : PATH.PLAYER_PATH} replace /> : <LoginPage onLogin={(userId) => { void handleLoginSuccess(userId); }} />} />
                  <Route path={PATH.LOGIN_GODMODE_PATH} element={isLoggedIn ? <Navigate to={isGuestMode ? PATH.CREATE_TEAMS_PATH : PATH.PLAYER_PATH} replace /> : <LoginPage onLogin={(userId) => { void handleLoginSuccess(userId); }} showDemoAccounts />} />
                  <Route path={PATH.HOME_PATH} element={isLoggedIn ? (isGuestMode ? <Navigate to={PATH.CREATE_TEAMS_PATH} replace /> : <Home />) : <Navigate to={PATH.LOGIN_PATH} replace />} />
                  <Route path={PATH.PLAYER_PATH} element={isLoggedIn ? (isGuestMode ? <Navigate to={PATH.CREATE_TEAMS_PATH} replace /> : <Players />) : <Navigate to={PATH.LOGIN_PATH} replace />} />
                  <Route path={PATH.CREATE_TEAMS_PATH} element={isLoggedIn ? <CreateTeamsWorkflow /> : <Navigate to={PATH.LOGIN_PATH} replace />} />
                  <Route path="*" element={<Navigate to={PATH.BASE_PATH} replace />} />
                </Routes>
              )}
            </div>
          </div>
        </div>
      </Router>
    </UserContext.Provider>
  );
};

export default App;
