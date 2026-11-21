import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Calendar,
  Building2,
  Plus,
  LogOut,
  User,
  LogIn,
  UserPlus,
  Sparkles,
  ClipboardList,
  Bell,
  Check,
  CheckCheck,
  Clock,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isCliente, isFornecedor, logout } = useAuth();
  const navigate = useNavigate();

  // Estados do Sininho de Notificações
  const [contadorNotif, setContadorNotif] = useState(0);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [notificacoesPreview, setNotificacoesPreview] = useState([]);
  const [carregandoPreview, setCarregandoPreview] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const carregarContador = async () => {
    if (!user?.id_usuario) return;
    try {
      const res = await api.get(`/notificacoes/contador/${user.id_usuario}`);
      setContadorNotif(res.total_pendentes || 0);
    } catch {
      // Ignora erro silenciosamente
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id_usuario) {
      carregarContador();
      const intervalo = setInterval(carregarContador, 15000); // Checa a cada 15 segundos
      return () => clearInterval(intervalo);
    } else {
      setContadorNotif(0);
      setDropdownAberto(false);
    }
  }, [isAuthenticated, user?.id_usuario]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickFora(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    }
    if (dropdownAberto) {
      document.addEventListener('mousedown', handleClickFora);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, [dropdownAberto]);

  const toggleDropdown = async () => {
    const novoEstado = !dropdownAberto;
    setDropdownAberto(novoEstado);
    if (novoEstado && user?.id_usuario) {
      setCarregandoPreview(true);
      try {
        const data = await api.get(`/notificacoes/usuario/${user.id_usuario}?limit=6`);
        setNotificacoesPreview(data);
      } catch {
        setNotificacoesPreview([]);
      } finally {
        setCarregandoPreview(false);
      }
    }
  };

  const marcarItemLido = async (idNotificacao, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notificacoes/${idNotificacao}/lida`);
      setNotificacoesPreview((prev) =>
        prev.map((n) => (n.id_notificacao === idNotificacao ? { ...n, visualizada: true } : n))
      );
      setContadorNotif((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const marcarTodasLidasNavbar = async () => {
    if (!user?.id_usuario) return;
    try {
      await api.put(`/notificacoes/usuario/${user.id_usuario}/marcar-todas-lidas`);
      setNotificacoesPreview((prev) => prev.map((n) => ({ ...n, visualizada: true })));
      setContadorNotif(0);
    } catch (err) {
      console.error(err);
    }
  };

  const formatarHora = (dataStr) => {
    if (!dataStr) return '';
    try {
      const d = new Date(dataStr);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) +
        ' · ' +
        d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return dataStr;
    }
  };

  return (
    <nav className="navbar" style={{ position: 'relative' }}>
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

              {/* Sininho de Notificações com Dropdown */}
              <li ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className="nav-link"
                  title="Notificações"
                  style={{
                    background: 'none',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: dropdownAberto ? '#38bdf8' : '#e2e8f0',
                  }}
                >
                  <Bell size={20} />
                  {contadorNotif > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '1px',
                        right: '1px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        borderRadius: '50%',
                        minWidth: '17px',
                        height: '17px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 3px',
                        boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      {contadorNotif > 9 ? '9+' : contadorNotif}
                    </span>
                  )}
                </button>

                {/* Balão Suspenso (Dropdown) de Notificações */}
                {dropdownAberto && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '340px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
                      border: '1px solid #e2e8f0',
                      zIndex: 9999,
                      overflow: 'hidden',
                      animation: 'fadeIn 0.15s ease-out',
                    }}
                  >
                    {/* Cabeçalho do Dropdown */}
                    <div
                      style={{
                        padding: '0.85rem 1rem',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Bell size={16} color="var(--primary)" />
                        <strong style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                          Notificações
                        </strong>
                        {contadorNotif > 0 && (
                          <span
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '8px',
                            }}
                          >
                            {contadorNotif} novas
                          </span>
                        )}
                      </div>

                      {contadorNotif > 0 && (
                        <button
                          type="button"
                          onClick={marcarTodasLidasNavbar}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                          title="Marcar todas como lidas"
                        >
                          <CheckCheck size={14} />
                          Limpar
                        </button>
                      )}
                    </div>

                    {/* Corpo com lista de notificações */}
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {carregandoPreview ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                          Carregando notificações...
                        </div>
                      ) : notificacoesPreview.length === 0 ? (
                        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                          <Bell size={28} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                            Nenhuma notificação no momento.
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {notificacoesPreview.map((notif) => (
                            <div
                              key={notif.id_notificacao}
                              style={{
                                padding: '0.75rem 1rem',
                                borderBottom: '1px solid #f1f5f9',
                                backgroundColor: notif.visualizada ? '#ffffff' : '#f0f9ff',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '0.6rem',
                                transition: 'background-color 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', flex: 1 }}>
                                <div
                                  style={{
                                    marginTop: '4px',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: notif.visualizada ? '#cbd5e1' : '#0284c7',
                                    flexShrink: 0,
                                  }}
                                />
                                <div>
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: '0.82rem',
                                      color: '#1e293b',
                                      lineHeight: 1.4,
                                      fontWeight: notif.visualizada ? 400 : 600,
                                    }}
                                  >
                                    {notif.mensagem}
                                  </p>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      fontSize: '0.72rem',
                                      color: '#64748b',
                                      marginTop: '0.3rem',
                                    }}
                                  >
                                    <Clock size={11} />
                                    {formatarHora(notif.data_envio)}
                                  </span>
                                </div>
                              </div>

                              {!notif.visualizada && (
                                <button
                                  type="button"
                                  onClick={(e) => marcarItemLido(notif.id_notificacao, e)}
                                  title="Marcar como lida"
                                  style={{
                                    border: 'none',
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    cursor: 'pointer',
                                    padding: '0.2rem 0.4rem',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Check size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rodapé do Dropdown */}
                    <div
                      style={{
                        padding: '0.6rem 1rem',
                        backgroundColor: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        textAlign: 'center',
                      }}
                    >
                      <Link
                        to="/notificacoes"
                        onClick={() => setDropdownAberto(false)}
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Ver todas as notificações &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </li>

              {/* Identificação do Usuário */}
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
