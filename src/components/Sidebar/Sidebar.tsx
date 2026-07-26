// Sidebar.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { PATH } from '../../constants/path';
import { clearActiveUser } from '../../utils/authStorageUtils';

interface SidebarProps {
  isOpen: boolean,
  onToggleSidebar: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggleSidebar}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearActiveUser();
    onToggleSidebar();
    navigate(PATH.LOGIN_PATH);
  };

  return (
    <nav className={isOpen ? 'open' : ''}>
      <ul>
        <li>
          <Link to={PATH.PLAYER_PATH} onClick={onToggleSidebar}>Players</Link>
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
