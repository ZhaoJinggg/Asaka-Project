import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Home from './components/Home';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ?
                <Navigate to="/home" replace /> :
                <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/home"
            element={
              isAuthenticated ?
                <Home onLogout={handleLogout} /> :
                <Navigate to="/login" replace />
            }
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
