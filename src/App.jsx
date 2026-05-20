import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/Home/HomePage';
import HotelsPage from './pages/Hotels/HotelsPage';
import HotelDetailsPage from './pages/Hotels/HotelDetailsPage';
import BookingPage from './pages/Hotels/BookingPage';
import ConfirmationPage from './pages/Hotels/ConfirmationPage';
import CabsPage from './pages/Cabs/CabsPage';
import RideConfirmationPage from './pages/Cabs/RideConfirmationPage';
import AuthPage from './pages/Auth/AuthPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import SupportPage from './pages/Support/SupportPage';
import AdminPage from './pages/Admin/AdminPage';
import RequireAuth from './components/auth/RequireAuth';

function App() {
  console.log("App.jsx: App component is rendering");
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RequireAuth><RootLayout /></RequireAuth>}>
          <Route index element={<HomePage />} />
          <Route path="hotels" element={<HotelsPage />} />
          <Route path="hotels/:id" element={<HotelDetailsPage />} />
          <Route path="hotels/:id/book" element={<BookingPage />} />
          <Route path="booking-confirmation" element={<ConfirmationPage />} />
          <Route path="cabs" element={<CabsPage />} />
          <Route path="ride-confirmation" element={<RideConfirmationPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
        <Route path="/auth" element={<AuthPage />} />

      </Routes>
    </Router>
  );
}

export default App;
