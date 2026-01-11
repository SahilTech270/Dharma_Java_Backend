import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import TempleSelector from "./features/TempleSelector";
import SlotManager from "./features/SlotManager";
import Login from "./features/Login";
import Register from "./features/Register";
import Layout from "./components/Layout";
import Dashboard from "./features/Dashboard";
import ParkingDashboard from "./features/ParkingDashboard";
import CameraView from "./features/CameraView";
import AddStaff from "./features/AddStaff";
import Profile from "./features/Profile";
import HeatMap from "./features/HeatMap";
import SarimaX from "./features/SarimaX";
import { getTemples } from "./services/api";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

// Helper hook for fetching temples
function useTemples() {
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeTemples = async () => {
      try {
        let fetchedTemples = await getTemples();

        if (fetchedTemples.length === 0) {
          console.log("No temples found in database.");
        }

        const uniqueTemples = Array.from(new Map(fetchedTemples.map(t => [t.templeId, t])).values());
        setTemples(uniqueTemples);
      } catch (error) {
        console.error("Failed to initialize temples", error);
      } finally {
        setLoading(false);
      }
    };

    initializeTemples();
  }, []);

  return { temples, loading };
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
    </div>
  );
}

export default function App() {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const { temples, loading } = useTemples();

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleLogin} />} />

          {/* Protected Routes */}
          <Route path="/" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                {temples.length > 0 ? (
                  <Navigate to={`/temple/${temples[0].templeId || temples[0].id}/dashboard`} replace />
                ) : (
                  <Navigate to="/select-temple" replace />
                )}
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/select-temple" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <TempleSelector temples={temples} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Temple Specific Routes */}
          <Route path="/temple/:templeId/dashboard" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/temple/:templeId/slots" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <SlotManager />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/temple/:templeId/heatmap" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <HeatMap />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/temple/:templeId/parking" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <ParkingDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/temple/:templeId/camera" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <CameraView />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/temple/:templeId/sarimax" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <SarimaX />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/add-yourself" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <AddStaff />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/profile" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Profile user={user} onUpdate={handleLogin} onLogout={handleLogout} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
