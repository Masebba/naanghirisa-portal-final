import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from './PageTemplate';
import { authService } from '../services/authService';
import { notify } from '../services/notifications';
import { UserRole } from '../types';

const SetupAdmin: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const createFirstAdmin = async () => {
    try {
      await authService.registerUser({ id: '', name, email, password, role: UserRole.SUPER_ADMIN });
      notify('First admin account created');
      navigate('/dashboard');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Setup failed', 'error');
    }
  };

  return (
    <PageTemplate title="First admin setup" subtitle="Use this only once on a fresh deployment.">
      <div className="stack">
        <input className="input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="primary-button" onClick={createFirstAdmin}>Create admin</button>
      </div>
    </PageTemplate>
  );
};

export default SetupAdmin;
