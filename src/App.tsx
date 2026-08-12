import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { Loans } from './pages/Loans';
import { Reservations } from './pages/Reservations';
import { Authors } from './pages/Authors';
import { Students } from './pages/Students';
import { OverdueLoans } from './pages/OverdueLoans';
import './index.css';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="livros" element={<Books />} />
        <Route path="autores" element={<Authors />} />
        <Route path="alunos" element={<Students />} />
        <Route path="emprestimos" element={<Loans />} />
        <Route path="atrasados" element={<OverdueLoans />} />
        <Route path="reservas" element={<Reservations />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
