import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../constants/path';
import { authenticateUser, GUEST_USER_ID, saveActiveUser } from '../../../utils/authStorageUtils';

interface LoginPageProps {
  onLogin: (userId: string | null) => void | Promise<void>;
  showDemoAccounts?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, showDemoAccounts = false }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!username.trim()) {
        setErrorMessage('Username is required.');
        return;
      }

      const user = await authenticateUser(username.trim(), password);
      if (!user) {
        setErrorMessage('That username/password combination was not found. Use one of the demo accounts below.');
        return;
      }

      saveActiveUser(user.id);
      await onLogin(user.id);
      navigate(PATH.PLAYER_PATH);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestMode = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      saveActiveUser(GUEST_USER_ID);
      await onLogin(GUEST_USER_ID);
      navigate(PATH.CREATE_TEAMS_PATH);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <h1>DraftMaster</h1>
        <p>Sign in with a demo account to manage your roster and build balanced teams.</p>
      </div>

      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username" className="field-label">Username</label>
        <input
          id="username"
          type="text"
          placeholder="coach_sam"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="password" className="field-label">Password</label>
        <input
          id="password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : 'Login'}</button>
      </form>

      <div className="guest-mode-section">
        <button type="button" className="guest-mode-button" onClick={() => void handleGuestMode()} disabled={isSubmitting}>
          Continue As Guest
        </button>
        <p className="guest-mode-note">Guest mode opens Team Builder only. Dashboard/Profile features are disabled.</p>
      </div>

      {showDemoAccounts && (
        <div className="demo-accounts">
          <h3>Demo Accounts</h3>
          <ul>
            <li><strong>temp</strong> / <strong>temp</strong></li>
            <li><strong>ada@example.com</strong> / <strong>Password1</strong></li>
            <li><strong>grace@example.com</strong> / <strong>Password2</strong></li>
            <li><strong>margaret@example.com</strong> / <strong>Password3</strong></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
