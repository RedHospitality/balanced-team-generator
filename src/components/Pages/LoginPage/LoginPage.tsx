import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../constants/path';
import { authenticateUser, createUserAccount, saveActiveUser } from '../../../utils/authStorageUtils';

interface LoginPageProps {
  onLogin: (userId: string | null) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (loginMode) {
      const user = authenticateUser(username, password);
      if (!user) {
        setErrorMessage('That username/password combination was not found. Try signing up first.');
        return;
      }

      saveActiveUser(user.id);
      onLogin(user.id);
      navigate(PATH.HOME_PATH);
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const newUser = createUserAccount({
        firstName,
        lastName,
        username: email,
        email,
        password,
      });

      saveActiveUser(newUser.id);
      onLogin(newUser.id);
      navigate(PATH.HOME_PATH);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create an account.');
    }
  };

  const toggleMode = () => {
    setLoginMode(!loginMode);
    setErrorMessage(null);
  };

  return (
    <div className="login-page">
      <h2>{loginMode ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        {!loginMode && (
          <div className="form-row">
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        )}
        {loginMode ? (
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        ) : (
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        )}
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {!loginMode && (
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        )}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit">{loginMode ? 'Login' : 'Sign Up'}</button>
      </form>
      <p>{loginMode ? 'Don\'t have an account? ' : 'Already have an account? '}<span onClick={toggleMode}>{loginMode ? 'Sign up' : 'Login'}</span></p>
    </div>
  );
};

export default LoginPage;
