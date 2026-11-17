import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import MeusEventos from './pages/MeusEventos';
import CadastroEvento from './pages/CadastroEvento';
import MeusLocais from './pages/MeusLocais';
import CadastroLocal from './pages/CadastroLocal';
import ReservasRecebidas from './pages/ReservasRecebidas';
import Reserva from './pages/Reserva';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/reserva/:id_local" element={<Reserva />} />

            {/* Rotas Exclusivas do Cliente (Organizador) */}
            <Route
              path="/meus-eventos"
              element={
                <ProtectedRoute role="Cliente">
                  <MeusEventos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eventos/novo"
              element={
                <ProtectedRoute role="Cliente">
                  <CadastroEvento />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eventos/editar/:id"
              element={
                <ProtectedRoute role="Cliente">
                  <CadastroEvento />
                </ProtectedRoute>
              }
            />

            {/* Rotas Exclusivas do Fornecedor (Proprietário) */}
            <Route
              path="/meus-locais"
              element={
                <ProtectedRoute role="Fornecedor">
                  <MeusLocais />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservas-recebidas"
              element={
                <ProtectedRoute role="Fornecedor">
                  <ReservasRecebidas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/locais/novo"
              element={
                <ProtectedRoute role="Fornecedor">
                  <CadastroLocal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/locais/editar/:id"
              element={
                <ProtectedRoute role="Fornecedor">
                  <CadastroLocal />
                </ProtectedRoute>
              }
            />

            {/* Rota padrão para páginas não encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
