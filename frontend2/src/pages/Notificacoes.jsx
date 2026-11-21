import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Bell, Check, CheckCheck, ArrowLeft, Clock } from 'lucide-react';

export default function Notificacoes() {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas'); // 'todas' | 'pendentes'

  const carregarNotificacoes = async () => {
    if (!user?.id_usuario) return;
    setLoading(true);
    setError('');
    try {
      const endpoint = filtro === 'pendentes'
        ? `/notificacoes/pendentes/${user.id_usuario}`
        : `/notificacoes/usuario/${user.id_usuario}?limit=50`;
      const data = await api.get(endpoint);
      setNotificacoes(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar notificações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarNotificacoes();
  }, [user, filtro]);

  const marcarComoLida = async (idNotificacao) => {
    try {
      await api.put(`/notificacoes/${idNotificacao}/lida`);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id_notificacao === idNotificacao ? { ...n, visualizada: true } : n))
      );
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const marcarTodasComoLidas = async () => {
    if (!user?.id_usuario) return;
    try {
      await api.put(`/notificacoes/usuario/${user.id_usuario}/marcar-todas-lidas`);
      setNotificacoes((prev) => prev.map((n) => ({ ...n, visualizada: true })));
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    try {
      const d = new Date(dataStr);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dataStr;
    }
  };

  const totalNaoLidas = notificacoes.filter((n) => !n.visualizada).length;

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--secondary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={24} color="var(--primary)" />
              Minhas Notificações
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Acompanhe novidades, confirmações de reservas e avisos importantes da sua conta.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {totalNaoLidas > 0 && (
              <button
                type="button"
                onClick={marcarTodasComoLidas}
                className="btn btn-sm btn-outline-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <CheckCheck size={16} />
                Marcar todas como lidas
              </button>
            )}
            <Link to="/" className="btn btn-sm btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setFiltro('todas')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: filtro === 'todas' ? 'var(--secondary)' : 'transparent',
              color: filtro === 'todas' ? '#ffffff' : '#64748b',
            }}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFiltro('pendentes')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: filtro === 'pendentes' ? 'var(--secondary)' : 'transparent',
              color: filtro === 'pendentes' ? '#ffffff' : '#64748b',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>Não lidas</span>
            {totalNaoLidas > 0 && (
              <span
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                {totalNaoLidas}
              </span>
            )}
          </button>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Lista de Notificações */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
            Carregando notificações...
          </div>
        ) : notificacoes.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                color: '#94a3b8',
                marginBottom: '1rem',
              }}
            >
              <Bell size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#334155', marginBottom: '0.35rem' }}>
              Nenhuma notificação encontrada
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              {filtro === 'pendentes'
                ? 'Você não possui notificações não lidas no momento.'
                : 'Você ainda não recebeu avisos do sistema.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notificacoes.map((item) => (
              <div
                key={item.id_notificacao}
                style={{
                  backgroundColor: item.visualizada ? '#ffffff' : '#f0f9ff',
                  border: item.visualizada ? '1px solid #e2e8f0' : '1px solid #bae6fd',
                  borderRadius: '10px',
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: item.visualizada ? 'none' : '0 2px 8px rgba(2, 132, 199, 0.08)',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', flex: 1 }}>
                  <div
                    style={{
                      marginTop: '3px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: item.visualizada ? '#cbd5e1' : '#0284c7',
                      flexShrink: 0,
                    }}
                    title={item.visualizada ? 'Lida' : 'Não lida'}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.94rem', color: '#1e293b', lineHeight: 1.5, fontWeight: item.visualizada ? 400 : 600 }}>
                      {item.mensagem}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.78rem', color: '#64748b' }}>
                      <Clock size={13} />
                      <span>{formatarData(item.data_envio)}</span>
                    </div>
                  </div>
                </div>

                {!item.visualizada && (
                  <button
                    type="button"
                    onClick={() => marcarComoLida(item.id_notificacao)}
                    title="Marcar como lida"
                    style={{
                      border: 'none',
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={14} />
                    Lida
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
