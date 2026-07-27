// Sidebar.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { PATH } from '../../constants/path';
import { clearActiveUser } from '../../utils/authStorageUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface SidebarProps {
  isOpen: boolean,
  onToggleSidebar: () => void,
  onLogout: () => void,
  isGuestMode: boolean,
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggleSidebar, onLogout, isGuestMode}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearActiveUser();
    onLogout();
    navigate(PATH.LOGIN_PATH);
  };

  return (
    <nav className={isOpen ? 'open' : ''} aria-label="Primary navigation">
      <div className="sidebar-top">
        <span className="sidebar-brand">DraftMaster</span>
        <button
          type="button"
          className="sidebar-close"
          aria-label="Close navigation menu"
          onClick={onToggleSidebar}
        >
          <FontAwesomeIcon icon={faXmark as IconProp} />
        </button>
      </div>
      <ul>
        {!isGuestMode && (
          <li>
            <Link to={PATH.PLAYER_PATH} onClick={onToggleSidebar}>Dashboard</Link>
          </li>
        )}
        <li>
          <Link to={PATH.CREATE_TEAMS_PATH} onClick={onToggleSidebar}>Team Builder</Link>
        </li>
        {!isGuestMode && (
          <li>
            <Link to={PATH.HOME_PATH} onClick={onToggleSidebar}>About</Link>
          </li>
        )}
        <li>
          <button className="sidebar-logout" onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
