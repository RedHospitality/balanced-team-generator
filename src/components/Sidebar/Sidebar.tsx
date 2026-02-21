// Sidebar.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import { PATH } from '../../constants/path';

interface SidebarProps {
  isOpen: boolean,
  onToggleSidebar: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggleSidebar}) => {
  return (
    <nav className={isOpen ? 'open' : ''}>
      <ul>
        <li>
          <Link to={PATH.HOME_PATH} onClick={onToggleSidebar}>Home</Link>
        </li>
        <li>
          <Link to={PATH.PLAYER_PATH} onClick={onToggleSidebar}>Players</Link>
        </li>
        <li>
          <Link to={PATH.CREATE_TEAMS_PATH} onClick={onToggleSidebar}>Create Teams</Link>
        </li>
        {/* Add other sidebar items with Link components */}
      </ul>
    </nav>
  );
};

export default Sidebar;
