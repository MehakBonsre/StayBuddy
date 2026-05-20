import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';

export default function RequireAuth({ children }) {
  const location = useLocation();
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return children;
}

