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
import { getActiveUser, getUserPlayers } from './utils/authStorageUtils';

interface AppUserContext {
  userPlayers: PlayerModel[];
  setUserPlayers: React.Dispatch<React.SetStateAction<PlayerModel[]>>;
  currentUserId: string | null;
}

export const UserContext = createContext<AppUserContext>({
  userPlayers: [],
  setUserPlayers: () => {},
  currentUserId: null,
});

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userPlayers, setUserPlayers] = useState<PlayerModel[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const activeUser = getActiveUser();
    if (activeUser) {
      setIsLoggedIn(true);
      setCurrentUserId(activeUser.id);
      const storedPlayers = getUserPlayers(activeUser.id);
      setUserPlayers(storedPlayers?.players ?? []);
    }
  }, []);

  const handleLoginSuccess = (userId: string | null) => {
    setIsLoggedIn(Boolean(userId));
    setCurrentUserId(userId);
    if (userId) {
      const storedPlayers = getUserPlayers(userId);
      setUserPlayers(storedPlayers?.players ?? []);
    }
  };

  return (
    <UserContext.Provider value={{ userPlayers, setUserPlayers, currentUserId }}>
      <Router>
        <div className="App">
          <div className={`${isSidebarOpen ? 'leftDisplay' : 'leftHide'}`}>
            <Sidebar isOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />
          </div>

          <div className={`right ${isSidebarOpen ? '' : 'hide'}`}>
            <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} isLoggedIn={isLoggedIn} />
            <div className="content">
              <Routes>
                <Route path={PATH.BASE_PATH} element={isLoggedIn ? <Navigate to={PATH.PLAYER_PATH} /> : <Navigate to={PATH.LOGIN_PATH} />} />
                <Route path={PATH.LOGIN_PATH} element={isLoggedIn ? <Navigate to={PATH.PLAYER_PATH} /> : <LoginPage onLogin={handleLoginSuccess} />} />
                <Route path={PATH.HOME_PATH} element={isLoggedIn ? <Home /> : <Navigate to={PATH.LOGIN_PATH} />} />
                <Route path={PATH.PLAYER_PATH} element={isLoggedIn ? <Players /> : <Navigate to={PATH.LOGIN_PATH} />} />
                <Route path={PATH.CREATE_TEAMS_PATH} element={isLoggedIn ? <CreateTeamsWorkflow /> : <Navigate to={PATH.LOGIN_PATH} />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </UserContext.Provider>
  );
};

export default App;
