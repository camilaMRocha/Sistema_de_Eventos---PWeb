import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Filter,
} from 'lucide-react';

export default function ReservasRecebidas() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const carregarReservas = async () => {
    if (!user?.id_perfil) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/reservas/fornecedor/${user.id_perfil}`);
      setReservas(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar solicitações de reserva.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReservas();
  }, [user]);

  const handleAtualizarStatus = async (idReserva, novoStatus) => {
    const acaoTexto =
      novoStatus === 'Confirmado'
        ? 'aprovar'
        : novoStatus === 'Cancelado'
        ? 'recusar/cancelar'
        : 'concluir';

    if (!window.confirm(`Deseja realmente ${acaoTexto} esta reserva?`)) {
      return;
    }

    setActionLoadingId(idReserva);
    setError('');
    setMsg('');

    try {
      const atualizada = await api.put(`/reservas/${idReserva}/status`, {
        status_reserva: novoStatus,
      });

      setReservas((prev) =>
        prev.map((r) => (r.id_reserva === idReserva ? atualizada : r))
      );

      const feedback =
        novoStatus === 'Confirmado'
          ? 'Reserva aprovada com sucesso.'
          : novoStatus === 'Cancelado'
          ? 'Reserva cancelada.'
          : 'Reserva marcada como concluída.';

      setMsg(feedback);
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Falha ao atualizar o status da reserva.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmado':
        return <span className="badge badge-success">Confirmada</span>;
      case 'Pendente':
        return <span className="badge badge-warning">Pendente</span>;
      case 'Cancelado':
        return <span className="badge badge-danger">Cancelada</span>;
      case 'Concluido':
        return <span className="badge badge-info">Concluída</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const formatarData = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const reservasFiltradas = reservas.filter((r) => {
    if (filtroStatus === 'Todos') return true;
    return r.status_reserva === filtroStatus;
  });

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '0.3rem' }}>
            Reservas Recebidas
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Gerencie os agendamentos e solicitações de locação recebidas para os seus espaços.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} color="var(--text-muted)" />
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="Todos">Todos os Status</option>
            <option value="Pendente">Pendentes</option>
            <option value="Confirmado">Confirmadas</option>
            <option value="Concluido">Concluídas</option>
            <option value="Cancelado">Canceladas</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {msg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{msg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Carregando solicitações de reserva...
        </div>
      ) : reservasFiltradas.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid var(--border)',
          }}
        >
          <Calendar size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--secondary)' }}>
            Nenhuma reserva encontrada
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
            {filtroStatus === 'Todos'
              ? 'Você ainda não recebeu pedidos de locação para os seus espaços cadastrados.'
              : `Nenhuma reserva com o status "${filtroStatus}" no momento.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {reservasFiltradas.map((r) => {
            const isLoadingAction = actionLoadingId === r.id_reserva;

            return (
              <div
                key={r.id_reserva}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center justify-between" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Reserva #{r.id_reserva}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>
                      {r.nome_local}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {r.status_pagamento === 'Aprovado' ? (
                      <span
                        style={{
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <CheckCircle size={13} />
                        Pago ({r.metodo_pagamento})
                      </span>
                    ) : r.status_reserva === 'Confirmado' ? (
                      <span
                        style={{
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        Aguardando Pagamento
                      </span>
                    ) : null}
                    {getStatusBadge(r.status_reserva)}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.92rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>
                      Evento
                    </span>
                    <strong style={{ color: 'var(--secondary)' }}>{r.nome_evento}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>
                      Cliente Solicitante
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text)' }}>
                      <User size={15} color="var(--primary)" />
                      <span>{r.nome_cliente || 'Cliente'}</span>
                    </div>
                    {r.telefone_cliente && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                        <Phone size={13} />
                        <span>{r.telefone_cliente}</span>
                      </div>
                    )}
                    {r.email_cliente && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.1rem' }}>
                        <Mail size={13} />
                        <span>{r.email_cliente}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>
                      Período Agendado
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text)' }}>
                      <Clock size={15} color="var(--primary)" />
                      <span>{formatarData(r.data_hora_inicio)}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1.3rem' }}>
                      até {formatarData(r.data_hora_fim)}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>
                      Localização e Valor
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      <MapPin size={15} />
                      <span>{r.cidade} - {r.estado}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontWeight: 600 }}>
                      <DollarSign size={16} />
                      <span>
                        R$ {Number(r.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center justify-end gap-2"
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.85rem',
                    marginTop: '0.25rem',
                  }}
                >
                  {r.status_reserva === 'Pendente' && (
                    <>
                      <button
                        onClick={() => handleAtualizarStatus(r.id_reserva, 'Cancelado')}
                        disabled={isLoadingAction}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <XCircle size={16} />
                        Recusar Solicitação
                      </button>
                      <button
                        onClick={() => handleAtualizarStatus(r.id_reserva, 'Confirmado')}
                        disabled={isLoadingAction}
                        className="btn btn-sm btn-primary"
                      >
                        <CheckCircle size={16} />
                        Aprovar Reserva
                      </button>
                    </>
                  )}

                  {r.status_reserva === 'Confirmado' && (
                    <>
                      <button
                        onClick={() => handleAtualizarStatus(r.id_reserva, 'Cancelado')}
                        disabled={isLoadingAction}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <XCircle size={16} />
                        Cancelar Reserva
                      </button>
                      <button
                        onClick={() => handleAtualizarStatus(r.id_reserva, 'Concluido')}
                        disabled={isLoadingAction}
                        className="btn btn-sm btn-secondary"
                      >
                        <CheckCircle size={16} />
                        Marcar como Concluída
                      </button>
                    </>
                  )}

                  {(r.status_reserva === 'Cancelado' || r.status_reserva === 'Concluido') && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Nenhuma ação pendente
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}