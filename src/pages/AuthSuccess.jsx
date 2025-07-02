import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    console.log('Token from URL:', token);

    if (token) {
      setToken(token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, []);

  return <p>Logging you in...</p>;
};

export default AuthSuccess;
