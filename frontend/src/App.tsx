import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetail from './pages/EquipmentDetail';
import RepairsList from './pages/RepairsList';
import PurchaseTasks from './pages/PurchaseTasks';
import Procurements from './pages/Procurements';
import Dashboard from './pages/Dashboard';
import { User } from './api/api';
import './App.css';
import './styles.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setInitialized(true);
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    window.location.href = '/dashboard';
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!initialized) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && (
          <header className="header">
            <div className="header-content">
              <h1>Складской ТехКонтроль</h1>
              <nav>
                <Link to="/dashboard">Дашборд</Link>
                <Link to="/equipment">Техника</Link>
                <Link to="/repairs">Ремонты</Link>
                <Link to="/purchase">Закупки</Link>
                <Link to="/procurements" style={{ color: '#f59e0b', fontWeight: '600' }}>
                  44-ФЗ
                </Link>
                <span className="user-info">
                  {user.username} ({user.role})
                </span>
                <button onClick={logout} className="btn btn-danger">
                  Выход
                </button>
              </nav>
            </div>
          </header>
        )}
        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" /> : <Login onLogin={login} />}
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/equipment"
              element={user ? <EquipmentList /> : <Navigate to="/login" />}
            />
            <Route
              path="/equipment/:id"
              element={user ? <EquipmentDetail /> : <Navigate to="/login" />}
            />
            <Route
              path="/repairs"
              element={user ? <RepairsList /> : <Navigate to="/login" />}
            />
            <Route
              path="/purchase"
              element={user ? <PurchaseTasks /> : <Navigate to="/login" />}
            />
            <Route
              path="/procurements"
              element={user ? <Procurements /> : <Navigate to="/login" />}
            />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
