import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Calendar, MapPin, DollarSign, Clock, Users, AlertCircle, CheckCircle, ArrowLeft, Star } from 'lucide-react';

export default function Reserva() {
  const { id_local } = useParams();
  const { user, isAuthenticated, isCliente } = useAuth();
  const navigate = useNavigate();

  const [local, setLocal] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [idEventoSelecionado, setIdEventoSelecionado] = useState('');

  // Data e hora separadas (fiel ao HTML original)
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('18:00');
  const [dataFim, setDataFim] = useState('');
  const [horaFim, setHoraFim] = useState('18:00');

  const [valorCalculado, setValorCalculado] = useState(0);
  const [totalDias, setTotalDias] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Carregar detalhes do local
  useEffect(() => {
    if (!id_local) return;
    setLoading(true);
    api.get(`/locais/${id_local}`)
      .then(setLocal)
      .catch(() => setError('Erro ao carregar detalhes do espaço.'))
      .finally(() => setLoading(false));
  }, [id_local]);

  // Carregar eventos do cliente se estiver logado como Cliente
  useEffect(() => {
    if (isAuthenticated && isCliente && user?.id_perfil) {
      api.get(`/eventos/cliente/${user.id_perfil}`)
        .then((evs) => {
          setEventos(evs);
          if (evs.length > 0) {
            setIdEventoSelecionado(evs[0].id_evento);
          }
        })
        .catch(() => setEventos([]));
    }
  }, [isAuthenticated, isCliente, user]);

  // Recalcular valor total quando as datas mudarem
  useEffect(() => {
    if (!local || !dataInicio || !dataFim) {
      if (local) setValorCalculado(parseFloat(local.preco_diaria));
      return;
    }

    const inicio = new Date(`${dataInicio}T${horaInicio || '00:00'}:00`);
    const fim = new Date(`${dataFim}T${horaFim || '00:00'}:00`);

    if (fim > inicio) {
      const diffMs = fim - inicio;
      const diffDias = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      setTotalDias(diffDias);
      setValorCalculado(diffDias * parseFloat(local.preco_diaria));
    }
  }, [dataInicio, horaInicio, dataFim, horaFim, local]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!idEventoSelecionado) {
      setError('Por favor, selecione qual evento deseja vincular a este espaço.');
      return;
    }

    if (!dataInicio || !dataFim) {
      setError('Informe as datas e horários de início e término.');
      return;
    }

    const dataHoraInicioCompleta = `${dataInicio}T${horaInicio || '00:00'}:00`;
    const dataHoraFimCompleta = `${dataFim}T${horaFim || '00:00'}:00`;

    if (new Date(dataHoraFimCompleta) <= new Date(dataHoraInicioCompleta)) {
      setError('A data de término deve ser posterior à data de início.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        id_evento: parseInt(idEventoSelecionado, 10),
        id_local: parseInt(id_local, 10),
        data_hora_inicio: dataHoraInicioCompleta,
        data_hora_fim: dataHoraFimCompleta,
        valor_total: valorCalculado,
      };

      const res = await api.post('/reservas', payload);
      setSuccess(`Reserva #${res.id_reserva} solicitada com sucesso! Status inicial: Pendente.`);

      setTimeout(() => {
        navigate('/meus-eventos');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erro ao solicitar reserva. Verifique se o espaço já não está ocupado nesta data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Carregando informações do local...
      </div>
    );
  }

  if (!local) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Local não encontrado</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Voltar para a Vitrine
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div className="form-card" style={{ maxWidth: '750px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--secondary)' }}>
              Reservar Espaço para Evento
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Vincule seu evento a este local para solicitar a reserva ao proprietário.
            </p>
          </div>

          <Link to="/" className="btn btn-sm btn-secondary">
            <ArrowLeft size={16} />
            Vitrine
          </Link>
        </div>

        {/* Card Resumo do Local */}
        <div
          style={{
            backgroundColor: '#f1f5f9',
            padding: '1.25rem',
            borderRadius: '8px',
            marginBottom: '1.75rem',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>{local.nome}</h3>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
              R$ {parseFloat(local.preco_diaria).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / diária
            </span>
          </div>

          <div className="flex items-center gap-4" style={{ fontSize: '0.88rem', color: '#475569', flexWrap: 'wrap' }}>
            <span className="flex items-center gap-1">
              <MapPin size={15} />
              {local.cidade} / {local.estado}
            </span>
            <span className="flex items-center gap-1">
              <Users size={15} />
              Até {local.capacidade} pessoas
            </span>
            {local.total_avaliacoes > 0 ? (
              <span className="flex items-center gap-1" style={{ color: '#b45309', fontWeight: 600 }}>
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                {Number(local.nota_media).toFixed(1)} ({local.total_avaliacoes} {local.total_avaliacoes === 1 ? 'avaliação' : 'avaliações'})
              </span>
            ) : (
              <span className="flex items-center gap-1" style={{ color: '#64748b' }}>
                <Star size={14} color="#94a3b8" />
                Sem avaliações ainda
              </span>
            )}
            {local.proprietario && (
              <span>Proprietário: <strong>{local.proprietario}</strong></span>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.5rem' }}>
              Você precisa estar conectado à sua conta de Cliente para solicitar uma reserva.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/login" className="btn btn-primary">
                Fazer Login
              </Link>
              <Link to="/cadastro" className="btn btn-outline-primary">
                Criar Conta
              </Link>
            </div>
          </div>
        ) : !isCliente ? (
          <div className="alert alert-danger">
            <span>Você está conectado como Fornecedor. Apenas clientes organizadores podem solicitar reservas de locais.</span>
          </div>
        ) : eventos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.5rem' }}>
              Você ainda não tem nenhum evento cadastrado na sua conta. Crie o evento primeiro para vinculá-lo a este local.
            </p>
            <Link to="/eventos/novo" className="btn btn-primary">
              Cadastrar Meu Evento Primeiro
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Selecione o Evento que Acontecerá no Local *</label>
              <select
                required
                className="form-select"
                value={idEventoSelecionado}
                onChange={(e) => setIdEventoSelecionado(e.target.value)}
              >
                {eventos.map((ev) => (
                  <option key={ev.id_evento} value={ev.id_evento}>
                    {ev.nome_evento} ({ev.nome_categoria})
                  </option>
                ))}
              </select>
            </div>

            {/* Data e Horário separados exatamente como no HTML original */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Data e Horário de Início da Reserva *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                  <input
                    type="time"
                    required
                    className="form-control"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Data e Horário de Término da Reserva *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                  <input
                    type="time"
                    required
                    className="form-control"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Simulação do Valor */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1.5px solid #bbf7d0',
                margin: '1.5rem 0',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                    Cálculo Automático de Diárias:
                  </span>
                  <div style={{ color: '#15803d', fontSize: '0.9rem' }}>
                    {totalDias} {totalDias === 1 ? 'diária estimada' : 'diárias estimadas'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#166534' }}>Total Estimado da Locação</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#166534' }}>
                    R$ {valorCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <Calendar size={18} />
              {submitting ? 'Enviando Solicitação...' : 'Confirmar e Enviar Solicitação de Reserva'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}