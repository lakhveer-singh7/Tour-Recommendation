import { useAuth } from '../context/AuthContext';

const AuthDebug = () => {
  const { user, loading } = useAuth();
  
  const localToken = localStorage.getItem('token');
  const sessionToken = sessionStorage.getItem('token');
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Auth Debug Info:</h4>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>User: {user ? user.email : 'None'}</div>
      <div>localStorage token: {localToken ? 'Yes' : 'No'}</div>
      <div>sessionStorage token: {sessionToken ? 'Yes' : 'No'}</div>
      <div>Backend URL: {backendUrl ? 'Set' : 'Not Set'}</div>
      <div>Token length: {localToken?.length || sessionToken?.length || 0}</div>
    </div>
  );
};

export default AuthDebug; 