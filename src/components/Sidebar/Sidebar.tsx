// Sidebar.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { PATH } from '../../constants/path';
import { clearActiveUser } from '../../utils/authStorageUtils';

interface SidebarProps {
  isOpen: boolean,
  onToggleSidebar: () => void,
  onLogout: () => void,
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggleSidebar, onLogout}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearActiveUser();
    onLogout();
    navigate(PATH.LOGIN_PATH);
  };

  return (
    <nav className={isOpen ? 'open' : ''} aria-label="Primary navigation">
      <ul>
        <li>
          <Link to={PATH.PLAYER_PATH} onClick={onToggleSidebar}>Dashboard</Link>
        </li>
        <li>
          <Link to={PATH.CREATE_TEAMS_PATH} onClick={onToggleSidebar}>Team Builder</Link>
        </li>
        <li>
          <Link to={PATH.HOME_PATH} onClick={onToggleSidebar}>About</Link>
        </li>
        <li>
          <button className="sidebar-logout" onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
