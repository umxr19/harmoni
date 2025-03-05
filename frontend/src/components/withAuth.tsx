import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ErrorBoundary from './ErrorBoundary';

// Higher-order component to use auth
export const withAuth = <P extends object>(
  Component: React.ComponentType<P & { auth: ReturnType<typeof useAuth> }>
) => {
  const WithAuth: React.FC<P> = (props) => {
    const auth = useAuth();
    return <Component {...props} auth={auth} />;
  };

  return WithAuth;
};

// Higher-order component with error boundary
export const withAuthAndErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WithErrorBoundary: React.FC<P> = (props) => {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  return WithErrorBoundary;
};

export default withAuth; 