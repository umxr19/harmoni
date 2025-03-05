import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { Header } from './Header';

export const HeaderWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <Header />
    </AuthProvider>
  );
}; 