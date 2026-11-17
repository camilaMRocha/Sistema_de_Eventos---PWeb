import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Building2, Plus, LogOut, User, LogIn, UserPlus, Sparkles, ClipboardList } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isCliente, isFornecedor, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <Link to="/" className="nav-brand">
          <Sparkles size={24} color="#38bdf8" />
          <span>HeyEvents</span>
        </Link>

        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Vitrine
            </NavLink>
          </li>

          {isAuthenticated ? (
            <>
              {isCliente && (
                <>
                  <li>
                    <NavLink
                      to="/meus-eventos"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      <Calendar size={18} />
                      Meus Eventos
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/eventos/novo"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      <Plus size={18} />
                      Criar Evento
                    </NavLink>
                  </li>
                </>
              )}

              {isFornecedor && (
                <>
                  <li>
                    <NavLink
                      to="/meus-locais"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      <Building2 size={18} />
                      Meus Locais
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/reservas-recebidas"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      <ClipboardList size={18} />
                      Reservas Recebidas
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/locais/novo"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      <Plus size={18} />
                      Cadastrar Local
                    </NavLink>
                  </li>
                </>
              )}

              <li className="flex items-center gap-2" style={{ marginLeft: '0.5rem' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#e2e8f0',
                  }}
                >
                  <User size={15} color="#38bdf8" />
                  <strong>{user.nome || user.email}</strong>
                  <span style={{ opacity: 0.7, fontSize: '0.78rem' }}>
                    ({user.tipo_usuario})
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline-light"
                  title="Encerrar Sessão"
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="btn btn-sm btn-outline-light">
                  <LogIn size={16} />
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="btn btn-sm btn-primary">
                  <UserPlus size={16} />
                  Cadastrar-se
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
