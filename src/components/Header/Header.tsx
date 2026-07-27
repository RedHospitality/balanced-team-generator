import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBars } from '@fortawesome/free-solid-svg-icons';
import './Header.css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface HeaderProps {
  isSidebarOpen: boolean;
  isLoggedIn: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar, isLoggedIn }) => {
  return (
    <header>
      {isLoggedIn && 
        <button
          className="menu-icon"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          title={isSidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <FontAwesomeIcon icon={(isSidebarOpen ? faArrowLeft : faBars) as IconProp} />
        </button>
      }
      <h1 className="title">Club Roster Builder</h1>
    </header>
  );
};

export default Header;
