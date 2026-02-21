import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './components/Home';
import Players from './components/Pages/Players/Players';
import './App.css'; // Import your main CSS file
import { PATH } from './constants/path';
import CreateTeamsWorkflow from './components/Pages/CreateTeamsWorflow/CreateTeamsWorkflow';
import LoginPage from './components/Pages/LoginPage/LoginPage';
import { PlayerModel } from './components/Pages/CreateTeamsWorflow/Models/CreateTeamsModels';
import { PlayerList } from './mocks/PlayerMock';


interface AppUserContext{
  userPlayers: PlayerModel[],
  setUserPlayers: React.Dispatch<React.SetStateAction<PlayerModel[]>>
}
export const UserContext = createContext<AppUserContext>({
  userPlayers: [],
  setUserPlayers: () => {}
});


const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Assuming you have a state for login status
  const [userPlayers, setUserPlayers] = useState<PlayerModel[]>([]);

  const loginEnabled = false; // Feature flag for login functionality

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  React.useEffect(() => {
    setUserPlayers(PlayerList);
  }, []);

  return (
    <UserContext.Provider value={{userPlayers, setUserPlayers}}>
    <Router>
      <div className="App">
        <div className={`${isSidebarOpen ? 'leftDisplay' : 'leftHide'}`}>
          <Sidebar isOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar}/>
        </div>

        <div className={`right ${isSidebarOpen ? '' : 'hide'}`}>
          <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} isLoggedIn={isLoggedIn}/>
          <div className="content">
            <Routes>
              <Route
                path={PATH.HOME_PATH} element={ <Home />}
              />
              {loginEnabled && (
                <>
                  <Route
                    path={PATH.BASE_PATH} element={ <Home />}
                  />
                  <Route
                    path={PATH.LOGIN_PATH} element={ <LoginPage onLogin={setIsLoggedIn} />}
                  />
                </>
              )}
              <Route
                path={PATH.PLAYER_PATH}
                element={loginEnabled && !isLoggedIn ? <Navigate to={PATH.LOGIN_PATH} /> : <Players />}
              />
              <Route
                path={PATH.CREATE_TEAMS_PATH}
                element={loginEnabled && !isLoggedIn ? <Navigate to={PATH.LOGIN_PATH} /> : <CreateTeamsWorkflow />}
              />
              {!loginEnabled && (
                <Route
                  path={PATH.BASE_PATH} element={<Navigate to={PATH.HOME_PATH} />}
                />
              )}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
    </UserContext.Provider>
  );
};

export default App;
