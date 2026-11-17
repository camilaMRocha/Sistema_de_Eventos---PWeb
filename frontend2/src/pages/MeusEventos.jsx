import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';

function sanitizarTexto(str) {
  if (!str || typeof str !== 'string') return str || '';
  return str
    .replace(/├Í/g, 'á')
    .replace(/├í/g, 'á')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã£/g, 'ã')
    .replace(/Ãµ/g, 'õ')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã§/g, 'ç')
    .replace(/├ú/g, 'ã')
    .replace(/├ç/g, 'ç')
    .replace(/├®/g, 'é')
    .replace(/├│/g, 'ó')
    .replace(/├║/g, 'ú')
    .replace(/Anivers[^\w\s]*rio/gi, 'Aniversário');
}

export default function MeusEventos() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [modalExcluir, setModalExcluir] = useState(null);

  const carregarEventos = async () => {
    if (!user?.id_perfil) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/eventos/cliente/${user.id_perfil}`);
      setEventos(data);
    } catch (err) {
      setError(err.message || 'Falha ao obter eventos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, [user]);

  const abrirModalExcluir = (evento) => {
    setModalExcluir(evento);
  };

  const confirmarExclusao = async () => {
    if (!modalExcluir) return;
    try {
      await api.delete(`/eventos/${modalExcluir.id_evento}`);
      setMsg(`Evento "${modalExcluir.nome_evento}" excluído com sucesso.`);
      setEventos((prev) => prev.filter((e) => e.id_evento !== modalExcluir.id_evento));
      setModalExcluir(null);
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Erro ao excluir evento.');
      setModalExcluir(null);
    }
  };

  const formatarDataHora = (isoString) => {
    if (!isoString) return 'Data não informada';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const eventosFiltrados = eventos.filter((ev) => {
    if (!filtroTexto.trim()) return true;
    const termo = filtroTexto.toLowerCase();
    const nome = (ev.nome_evento || '').toLowerCase();
    const cat = (ev.nome_categoria || '').toLowerCase();
    const desc = (ev.descricao_evento || '').toLowerCase();
    return nome.includes(termo) || cat.includes(termo) || desc.includes(termo);
  });

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3.5rem' }}>
      <div className="section-header-underline">
        <h2>Meus eventos</h2>
      </div>

      <div style={{ maxWidth: '400px', margin: '0 auto 2rem auto', position: 'relative' }}>
        <input
          type="text"
          className="form-control"
          style={{ borderRadius: '9999px', paddingLeft: '2.5rem' }}
          placeholder="Pesquise eventos..."
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />
        <Search
          size={18}
          color="#94a3b8"
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>

      {error && (
        <div className="alert alert-danger" style={{ maxWidth: '850px', margin: '0 auto 1.5rem auto' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {msg && (
        <div className="alert alert-success" style={{ maxWidth: '850px', margin: '0 auto 1.5rem auto' }}>
          <CheckCircle size={18} />
          <span>{msg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0', color: '#64748b' }}>
          Carregando seus eventos...
        </div>
      ) : eventosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <p style={{ color: '#475569', fontSize: '1.15rem', marginBottom: '0.5rem' }}>
            {filtroTexto.trim()
              ? 'Nenhum evento corresponde à sua pesquisa.'
              : 'Você ainda não possui eventos cadastrados.'}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Clique no botão (+) abaixo para cadastrar seu primeiro evento na plataforma.
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {eventosFiltrados.map((ev) => {
            const dataInicio = formatarDataHora(ev.data_hora_inicio);
            const dataFim = formatarDataHora(ev.data_hora_termino);
            const orcamento = parseFloat(ev.orcamento_estimado || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            });

            const catNome = sanitizarTexto(ev.nome_categoria);
            const tipoNome = sanitizarTexto(ev.tipo_evento);
            const categoriaTexto = tipoNome ? `${tipoNome} - ${catNome}` : catNome || 'Geral';
            const visibilidadeTexto = ev.visibilidade === 'Publico' ? 'Público' : ev.visibilidade || 'Privado';
            const formatoTexto = ev.formato || 'Presencial';

            const imagemUrl =
              ev.fotos_urls && ev.fotos_urls.length > 0 && ev.fotos_urls[0] ? ev.fotos_urls[0] : null;

            return (
              <div key={ev.id_evento} className="event-card">
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    {imagemUrl ? (
                      <img src={imagemUrl} alt={ev.nome_evento} className="event-img" />
                    ) : (
                      <div className="event-img-placeholder">
                        <span>{catNome || 'Evento'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <span
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#1e293b',
                          border: '1px solid #cbd5e1',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        {categoriaTexto}
                      </span>
                      <span
                        style={{
                          backgroundColor: '#64748b',
                          color: '#ffffff',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        {formatoTexto}
                      </span>
                      <span
                        style={{
                          backgroundColor: '#0ea5e9',
                          color: '#ffffff',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        {visibilidadeTexto}
                      </span>
                    </div>

                    <h4 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                      {ev.nome_evento}
                    </h4>

                    <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: '0.45rem' }}>
                      <strong>Início:</strong> {dataInicio} &nbsp;|&nbsp; <strong>Término:</strong> {dataFim}
                    </p>

                    <p style={{ color: '#64748b', fontSize: '0.86rem', marginBottom: '0.55rem' }}>
                      {ev.descricao_evento || 'Sem descrição informada para este evento.'}
                    </p>

                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                      Orçamento Estimado: <span style={{ color: '#16a34a' }}>{orcamento}</span>
                    </div>

                    <div style={{ fontSize: '0.88rem', marginTop: '0.4rem' }}>
                      {ev.local_reservado ? (
                        <div>
                          <strong>Local:</strong>{' '}
                          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{ev.local_reservado}</span>{' '}
                          <span
                            style={{
                              backgroundColor: ev.status_reserva === 'Confirmado' ? '#dcfce7' : '#fef3c7',
                              color: ev.status_reserva === 'Confirmado' ? '#166534' : '#92400e',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              marginLeft: '0.3rem',
                            }}
                          >
                            {ev.status_reserva}
                          </span>
                        </div>
                      ) : (
                        <div style={{ color: '#64748b' }}>
                          <strong>Local:</strong> <span>Ainda não reservado</span>{' '}
                          <Link
                            to="/#secaoEspacos"
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              textDecoration: 'none',
                              fontWeight: 600,
                              marginLeft: '0.4rem',
                            }}
                          >
                            Alugar espaço na vitrine
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '110px' }}>
                    <Link to={`/eventos/editar/${ev.id_evento}`} className="btn-teal">
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => abrirModalExcluir(ev)}
                      className="btn-coral"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chamada para criar novo evento */}
      <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '1rem' }}>
          Deseja criar mais eventos? Clique no mais abaixo
        </p>
        <Link to="/eventos/novo" className="btn-add-circle" title="Criar novo evento">
          +
        </Link>
      </div>

      {/* Modal de Confirmação de Exclusão (Figma / HTML) */}
      {modalExcluir && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h4
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1e293b',
                textDecoration: 'underline',
                marginBottom: '1.25rem',
              }}
            >
              Deseja excluir o evento
            </h4>

            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Você deseja quebrar o contrato? O local, serviços e clientes que se envolveram no evento serão notificados.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={() => setModalExcluir(null)}
                className="btn-coral"
                style={{ padding: '8px 24px' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                className="btn-teal"
                style={{ padding: '8px 24px' }}
              >
                Excluir evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}