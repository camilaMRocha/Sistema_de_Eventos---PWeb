import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Search,
  AlertCircle,
  CheckCircle,
  CreditCard,
  QrCode,
  Barcode,
  Copy,
  Check,
  FileText,
  X,
  Lock,
  Star,
  Ticket,
  Plus,
  Trash2,
} from 'lucide-react';

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
  const [modalPagamento, setModalPagamento] = useState(null);
  const [modalComprovante, setModalComprovante] = useState(null);
  const [modalAvaliacao, setModalAvaliacao] = useState(null);

  const [notaAvaliacao, setNotaAvaliacao] = useState(5);
  const [notaHover, setNotaHover] = useState(0);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState('');
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState('');

  const [metodoPagamento, setMetodoPagamento] = useState('Pix');
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [erroPagamento, setErroPagamento] = useState('');
  const [pixCopiado, setPixCopiado] = useState(false);

  const [numCartao, setNumCartao] = useState('4532 1234 5678 9012');
  const [titularCartao, setTitularCartao] = useState('CLIENTE HEYEVENTS');
  const [validadeCartao, setValidadeCartao] = useState('12/28');
  const [cvvCartao, setCvvCartao] = useState('123');

  const [modalIngressos, setModalIngressos] = useState(null);
  const [lotesIngressos, setLotesIngressos] = useState([]);
  const [loadingLotes, setLoadingLotes] = useState(false);
  const [novoTituloIngresso, setNovoTituloIngresso] = useState('Entrada Geral');
  const [novoTipoIngresso, setNovoTipoIngresso] = useState('Pago');
  const [novoPrecoIngresso, setNovoPrecoIngresso] = useState('50.00');
  const [novaQtdIngresso, setNovaQtdIngresso] = useState('100');
  const [salvandoIngresso, setSalvandoIngresso] = useState(false);
  const [erroIngresso, setErroIngresso] = useState('');
  const [sucessoIngresso, setSucessoIngresso] = useState('');

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

  const abrirModalAvaliacao = (ev) => {
    setModalAvaliacao(ev);
    setNotaAvaliacao(ev.nota_avaliacao || 5);
    setNotaHover(0);
    setComentarioAvaliacao(ev.comentario_avaliacao || '');
    setErroAvaliacao('');
  };

  const salvarAvaliacao = async (e) => {
    e.preventDefault();
    if (!modalAvaliacao || !user?.id_perfil) return;
    setEnviandoAvaliacao(true);
    setErroAvaliacao('');
    try {
      await api.post('/avaliacoes', {
        id_cliente: user.id_perfil,
        id_local: modalAvaliacao.id_local,
        id_reserva: modalAvaliacao.id_reserva,
        nota: notaAvaliacao,
        comentario: comentarioAvaliacao.trim() || null,
      });
      setMsg('Avaliação do espaço registrada com sucesso!');
      setModalAvaliacao(null);
      await carregarEventos();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setErroAvaliacao(err.message || 'Erro ao registrar avaliação.');
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  const abrirModalPagamento = (evento) => {
    setModalPagamento(evento);
    setMetodoPagamento('Pix');
    setErroPagamento('');
    setPixCopiado(false);
  };

  const handleEfetuarPagamento = async (e) => {
    e.preventDefault();
    if (!modalPagamento?.id_reserva) return;

    setProcessandoPagamento(true);
    setErroPagamento('');

    try {
      const payload = {
        id_reserva: modalPagamento.id_reserva,
        valor: modalPagamento.valor_reserva || 0,
        metodo_pagamento: metodoPagamento,
      };

      const resultado = await api.post('/pagamentos', payload);

      setEventos((prev) =>
        prev.map((ev) =>
          ev.id_evento === modalPagamento.id_evento
            ? {
                ...ev,
                id_pagamento: resultado.id_pagamento,
                status_pagamento: 'Aprovado',
                metodo_pagamento: resultado.metodo_pagamento,
                data_pagamento: resultado.data_pagamento,
              }
            : ev
        )
      );

      setModalPagamento(null);
      setModalComprovante(resultado);
      setMsg('Pagamento aprovado com sucesso! Sua reserva está garantida.');
      setTimeout(() => setMsg(''), 5000);
    } catch (err) {
      setErroPagamento(err.message || 'Erro ao processar o pagamento.');
    } finally {
      setProcessandoPagamento(false);
    }
  };

  const abrirComprovante = async (ev) => {
    try {
      if (ev.id_pagamento) {
        const dados = await api.get(`/pagamentos/${ev.id_pagamento}`);
        setModalComprovante(dados);
      } else if (ev.id_reserva) {
        const dados = await api.get(`/pagamentos/reserva/${ev.id_reserva}`);
        setModalComprovante(dados);
      }
    } catch (err) {
      setError(err.message || 'Comprovante não localizado.');
    }
  };

  const copiarCodigoPix = () => {
    const mockHash = '00020126580014BR.GOV.BCB.PIX0136heyevents-reserva-pagamento5204000053039865802BR5925HEYEVENTS PLATAFORMA6009CAMPINAS62070503***6304E8A2';
    navigator.clipboard.writeText(mockHash);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 3000);
  };

  const abrirModalIngressos = async (evento) => {
    setModalIngressos(evento);
    setErroIngresso('');
    setSucessoIngresso('');
    setNovoTituloIngresso('Entrada Geral');
    setNovoTipoIngresso('Pago');
    setNovoPrecoIngresso('50.00');
    setNovaQtdIngresso('100');
    await carregarLotesIngressos(evento.id_evento);
  };

  const carregarLotesIngressos = async (idEvento) => {
    setLoadingLotes(true);
    try {
      const data = await api.get(`/ingressos/evento/${idEvento}`);
      setLotesIngressos(data);
    } catch (err) {
      setErroIngresso(err.message || 'Erro ao carregar lotes de ingressos.');
    } finally {
      setLoadingLotes(false);
    }
  };

  const handleCriarIngresso = async (e) => {
    e.preventDefault();
    if (!modalIngressos) return;
    setSalvandoIngresso(true);
    setErroIngresso('');
    setSucessoIngresso('');
    try {
      await api.post('/ingressos', {
        id_evento: modalIngressos.id_evento,
        tipo_ingresso: novoTipoIngresso,
        titulo_ingresso: novoTituloIngresso,
        preco: novoTipoIngresso === 'Gratuito' ? 0 : parseFloat(novoPrecoIngresso),
        quantidade_total: parseInt(novaQtdIngresso, 10),
      });
      setSucessoIngresso('Lote de ingressos criado com sucesso!');
      await carregarLotesIngressos(modalIngressos.id_evento);
    } catch (err) {
      setErroIngresso(err.message || 'Erro ao cadastrar lote de ingressos.');
    } finally {
      setSalvandoIngresso(false);
    }
  };

  const handleExcluirIngresso = async (idIngresso) => {
    if (!window.confirm('Deseja realmente remover este lote de ingressos?')) return;
    try {
      await api.delete(`/ingressos/${idIngresso}`);
      setSucessoIngresso('Lote removido com sucesso!');
      await carregarLotesIngressos(modalIngressos.id_evento);
    } catch (err) {
      setErroIngresso(err.message || 'Erro ao remover lote.');
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
        <div className="alert alert-danger" style={{ maxWidth: '880px', margin: '0 auto 1.5rem auto' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {msg && (
        <div className="alert alert-success" style={{ maxWidth: '880px', margin: '0 auto 1.5rem auto' }}>
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

            const isPago = ev.status_pagamento === 'Aprovado';
            const isConfirmado = ev.status_reserva === 'Confirmado';
            const isConcluido = ev.status_reserva === 'Concluido';

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

                    <div style={{ fontSize: '0.88rem', marginTop: '0.5rem', backgroundColor: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      {ev.local_reservado ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <strong>Local:</strong>{' '}
                              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{ev.local_reservado}</span>{' '}
                              <span
                                style={{
                                  backgroundColor:
                                    ev.status_reserva === 'Confirmado'
                                      ? '#dcfce7'
                                      : ev.status_reserva === 'Concluido'
                                      ? '#e0f2fe'
                                      : '#fef3c7',
                                  color:
                                    ev.status_reserva === 'Confirmado'
                                      ? '#166534'
                                      : ev.status_reserva === 'Concluido'
                                      ? '#0369a1'
                                      : '#92400e',
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

                            {ev.valor_reserva && (
                              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                                Valor da Locação:{' '}
                                <strong style={{ color: 'var(--primary)' }}>
                                  R$ {Number(ev.valor_reserva).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </strong>
                              </div>
                            )}
                          </div>

                          <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #edf2f7', paddingTop: '0.4rem' }}>
                            {isPago ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span
                                  style={{
                                    backgroundColor: '#dcfce7',
                                    color: '#166534',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                  }}
                                >
                                  <CheckCircle size={14} />
                                  Locação Paga ({ev.metodo_pagamento})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => abrirComprovante(ev)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontSize: '0.82rem',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                  }}
                                >
                                  <FileText size={13} />
                                  Ver Comprovante
                                </button>
                              </div>
                            ) : isConfirmado ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <span style={{ color: '#b45309', fontSize: '0.82rem', fontWeight: 600 }}>
                                  Reserva confirmada. Efetue o pagamento para garantir a data:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => abrirModalPagamento(ev)}
                                  className="btn btn-sm btn-primary"
                                  style={{ padding: '0.3rem 0.85rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <CreditCard size={14} />
                                  Pagar Reserva
                                </button>
                              </div>
                            ) : !isConcluido ? (
                              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                O pagamento será liberado assim que o fornecedor aprovar o pedido.
                              </span>
                            ) : null}

                            {ev.id_avaliacao && (
                              <div style={{ marginTop: '0.6rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#92400e' }}>
                                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                  <span>Sua Avaliação: {ev.nota_avaliacao} de 5 estrelas</span>
                                </div>
                                {ev.comentario_avaliacao && (
                                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#78350f', fontStyle: 'italic' }}>
                                    "{ev.comentario_avaliacao}"
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '120px' }}>
                    {isConcluido ? (
                      <>
                        {ev.id_local && (
                          <button
                            type="button"
                            onClick={() => abrirModalAvaliacao(ev)}
                            style={{
                              backgroundColor: ev.id_avaliacao ? '#fef3c7' : '#f59e0b',
                              color: ev.id_avaliacao ? '#92400e' : '#ffffff',
                              border: ev.id_avaliacao ? '1px solid #fde68a' : 'none',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                            }}
                            title={ev.id_avaliacao ? 'Editar sua avaliação deste espaço' : 'Avaliar o espaço onde foi realizado seu evento'}
                          >
                            <Star size={14} fill={ev.id_avaliacao ? '#f59e0b' : '#ffffff'} color={ev.id_avaliacao ? '#f59e0b' : '#ffffff'} />
                            {ev.id_avaliacao ? 'Editar Avaliação' : 'Avaliar Espaço'}
                          </button>
                        )}
                        <span
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            cursor: 'default',
                          }}
                          title="Evento realizado. Dados e histórico arquivados."
                        >
                          Evento Concluído
                        </span>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => abrirModalIngressos(ev)}
                          style={{
                            backgroundColor: '#0ea5e9',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                          }}
                          title="Gerenciar lotes de ingressos deste evento"
                        >
                          <Ticket size={14} />
                          Ingressos
                        </button>
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '1rem' }}>
          Deseja criar mais eventos? Clique no mais abaixo
        </p>
        <Link to="/eventos/novo" className="btn-add-circle" title="Criar novo evento">
          +
        </Link>
      </div>

      {modalPagamento && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--secondary)', fontWeight: 700, margin: 0 }}>
                Pagamento da Reserva
              </h3>
              <button
                type="button"
                onClick={() => setModalPagamento(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '0.2rem' }}>
                Reserva #{modalPagamento.id_reserva} &bull; {modalPagamento.nome_evento}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                {modalPagamento.local_reservado}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#475569' }}>Valor da Locação:</span>
                <strong style={{ fontSize: '1.35rem', color: 'var(--primary)' }}>
                  R$ {Number(modalPagamento.valor_reserva || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {erroPagamento && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{erroPagamento}</span>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Selecione a forma de pagamento:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setMetodoPagamento('Pix')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '8px',
                    border: metodoPagamento === 'Pix' ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                    backgroundColor: metodoPagamento === 'Pix' ? '#f0f9ff' : '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: metodoPagamento === 'Pix' ? 'var(--primary)' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <QrCode size={20} />
                  Pix (Instantâneo)
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPagamento('Cartao de Credito')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '8px',
                    border: metodoPagamento === 'Cartao de Credito' ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                    backgroundColor: metodoPagamento === 'Cartao de Credito' ? '#f0f9ff' : '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: metodoPagamento === 'Cartao de Credito' ? 'var(--primary)' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <CreditCard size={20} />
                  Cartão de Crédito
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPagamento('Boleto')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '8px',
                    border: metodoPagamento === 'Boleto' ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                    backgroundColor: metodoPagamento === 'Boleto' ? '#f0f9ff' : '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: metodoPagamento === 'Boleto' ? 'var(--primary)' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Barcode size={20} />
                  Boleto Bancário
                </button>
              </div>
            </div>

            <form onSubmit={handleEfetuarPagamento}>
              {metodoPagamento === 'Pix' && (
                <div style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px dashed #cbd5e1', marginBottom: '0.75rem' }}>
                    <QrCode size={110} color="#0f172a" />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.75rem 0' }}>
                    Abra o app do seu banco e escaneie o QR Code ou use o código Copia e Cola:
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                    <input
                      type="text"
                      readOnly
                      value="00020126580014BR.GOV.BCB.PIX0136heyevents-reserva-pagamento..."
                      className="form-control"
                      style={{ fontSize: '0.8rem', maxWidth: '320px', backgroundColor: '#ffffff' }}
                    />
                    <button
                      type="button"
                      onClick={copiarCodigoPix}
                      className="btn btn-sm btn-outline-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      {pixCopiado ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      {pixCopiado ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}

              {metodoPagamento === 'Cartao de Credito' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>Número do Cartão</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={numCartao}
                      onChange={(e) => setNumCartao(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>Nome Impresso no Cartão</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={titularCartao}
                      onChange={(e) => setTitularCartao(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.82rem' }}>Validade</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="MM/AA"
                        value={validadeCartao}
                        onChange={(e) => setValidadeCartao(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.82rem' }}>CVV</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        className="form-control"
                        placeholder="123"
                        value={cvvCartao}
                        onChange={(e) => setCvvCartao(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {metodoPagamento === 'Boleto' && (
                <div style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                  <Barcode size={64} color="#334155" style={{ margin: '0 auto 0.5rem auto' }} />
                  <p style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#1e293b', marginBottom: '0.5rem' }}>
                    34191.79001 01043.510047 91020.150008 8 9876000000000
                  </p>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Vencimento: em 3 dias úteis. A confirmação ocorre automaticamente na simulação.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setModalPagamento(null)}
                  className="btn btn-secondary"
                  disabled={processandoPagamento}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processandoPagamento}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Lock size={15} />
                  {processandoPagamento
                    ? 'Confirmando...'
                    : `Confirmar Pagamento de R$ ${Number(modalPagamento.valor_reserva || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalComprovante && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <CheckCircle size={32} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
              Comprovante de Pagamento
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, display: 'block', marginBottom: '1.5rem' }}>
              Transação Aprovada com Sucesso
            </span>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '1rem', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.88rem', display: 'grid', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Identificador:</span>
                <strong>#{modalComprovante.id_pagamento}</strong>
              </div>
              {modalComprovante.id_reserva && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Reserva vinculada:</span>
                  <strong>#{modalComprovante.id_reserva}</strong>
                </div>
              )}
              {modalComprovante.nome_local && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Espaço:</span>
                  <strong>{modalComprovante.nome_local}</strong>
                </div>
              )}
              {modalComprovante.nome_evento && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Evento:</span>
                  <strong>{modalComprovante.nome_evento}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Método:</span>
                <strong>{modalComprovante.metodo_pagamento}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Data e Horário:</span>
                <strong>{formatarDataHora(modalComprovante.data_pagamento)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>Valor Pago:</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                  R$ {Number(modalComprovante.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalComprovante(null)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.7rem' }}
            >
              Fechar Comprovante
            </button>
          </div>
        </div>
      )}

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

      {modalAvaliacao && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setModalAvaliacao(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  color: '#f59e0b',
                  marginBottom: '0.75rem',
                }}
              >
                <Star size={28} fill="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                {modalAvaliacao.id_avaliacao ? 'Editar Avaliação' : 'Avaliar Espaço'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                {modalAvaliacao.local_reservado || 'Espaço de Eventos'}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                Evento: {modalAvaliacao.nome_evento}
              </p>
            </div>

            {erroAvaliacao && (
              <div className="alert alert-danger" style={{ marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                <AlertCircle size={16} />
                <span>{erroAvaliacao}</span>
              </div>
            )}

            <form onSubmit={salvarAvaliacao}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '0.6rem' }}>
                  Como foi sua experiência no local?
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map((estrela) => {
                    const ativa = (notaHover || notaAvaliacao) >= estrela;
                    return (
                      <button
                        key={estrela}
                        type="button"
                        onClick={() => setNotaAvaliacao(estrela)}
                        onMouseEnter={() => setNotaHover(estrela)}
                        onMouseLeave={() => setNotaHover(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          transform: ativa ? 'scale(1.15)' : 'scale(1)',
                          transition: 'transform 0.15s ease',
                        }}
                        title={`${estrela} estrela${estrela > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={32}
                          fill={ativa ? '#f59e0b' : '#e2e8f0'}
                          color={ativa ? '#f59e0b' : '#cbd5e1'}
                        />
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309' }}>
                  {notaAvaliacao === 1 && '1 estrela - Muito insatisfeito'}
                  {notaAvaliacao === 2 && '2 estrelas - Abaixo do esperado'}
                  {notaAvaliacao === 3 && '3 estrelas - Atendeu ao básico'}
                  {notaAvaliacao === 4 && '4 estrelas - Muito bom'}
                  {notaAvaliacao === 5 && '5 estrelas - Excelente! Super recomendado'}
                </span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  Depoimento ou Comentário (opcional)
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Escreva detalhes sobre o atendimento, limpeza, infraestrutura, pontos positivos e dicas para futuros clientes..."
                  value={comentarioAvaliacao}
                  onChange={(e) => setComentarioAvaliacao(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setModalAvaliacao(null)}
                  className="btn btn-secondary"
                  disabled={enviandoAvaliacao}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={enviandoAvaliacao}
                  style={{ minWidth: '150px' }}
                >
                  {enviandoAvaliacao ? 'Enviando...' : 'Salvar Avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalIngressos && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Ticket size={22} color="var(--primary)" />
                  Lotes de Ingressos
                </h3>
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  {modalIngressos.nome_evento}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalIngressos(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {erroIngresso && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                <AlertCircle size={18} />
                <span>{erroIngresso}</span>
              </div>
            )}

            {sucessoIngresso && (
              <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                <CheckCircle size={18} />
                <span>{sucessoIngresso}</span>
              </div>
            )}

            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                Lotes Atuais
              </h4>

              {loadingLotes ? (
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Carregando lotes...</p>
              ) : lotesIngressos.length === 0 ? (
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  Nenhum lote de ingressos cadastrado para este evento.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {lotesIngressos.map((lote) => {
                    const precoFormatado = Number(lote.preco) === 0
                      ? 'Gratuito'
                      : Number(lote.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    const vendidos = lote.quantidade_vendida || 0;
                    const disponiveis = lote.quantidade_disponivel !== undefined ? lote.quantidade_disponivel : lote.quantidade_total - vendidos;

                    return (
                      <div
                        key={lote.id_ingresso}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ color: '#1e293b', fontSize: '0.95rem' }}>{lote.titulo_ingresso || lote.titulo}</strong>
                            <span
                              style={{
                                backgroundColor: lote.tipo_ingresso === 'Gratuito' ? '#dcfce7' : '#e0f2fe',
                                color: lote.tipo_ingresso === 'Gratuito' ? '#166534' : '#0369a1',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                              }}
                            >
                              {lote.tipo_ingresso}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                            Preço: <strong style={{ color: '#16a34a' }}>{precoFormatado}</strong> &bull; Total: {lote.quantidade_total} &bull; Vendidos: {vendidos} &bull; Restantes: {disponiveis}
                          </div>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => handleExcluirIngresso(lote.id_ingresso)}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#ef4444',
                              border: '1px solid #fca5a5',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                            title="Remover lote de ingressos"
                          >
                            <Trash2 size={14} />
                            Excluir
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ backgroundColor: '#f1f5f9', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Plus size={18} color="var(--primary)" />
                Criar Novo Lote de Ingressos
              </h4>

              <form onSubmit={handleCriarIngresso}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Título do Lote</label>
                    <input
                      type="text"
                      className="form-control"
                      value={novoTituloIngresso}
                      onChange={(e) => setNovoTituloIngresso(e.target.value)}
                      required
                      placeholder="Ex: 1º Lote - Pista"
                      style={{ fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Tipo de Ingresso</label>
                    <select
                      className="form-control"
                      value={novoTipoIngresso}
                      onChange={(e) => {
                        const tipo = e.target.value;
                        setNovoTipoIngresso(tipo);
                        if (tipo === 'Gratuito') setNovoPrecoIngresso('0.00');
                      }}
                      style={{ fontSize: '0.88rem' }}
                    >
                      <option value="Pago">Pago</option>
                      <option value="Gratuito">Gratuito</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Preço Unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={novoPrecoIngresso}
                      onChange={(e) => setNovoPrecoIngresso(e.target.value)}
                      disabled={novoTipoIngresso === 'Gratuito'}
                      required
                      style={{ fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Quantidade Total de Ingressos</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={novaQtdIngresso}
                      onChange={(e) => setNovaQtdIngresso(e.target.value)}
                      required
                      style={{ fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={salvandoIngresso}
                    style={{ fontSize: '0.88rem', padding: '0.5rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Plus size={16} />
                    {salvandoIngresso ? 'Criando...' : 'Cadastrar Lote'}
                  </button>
                </div>
              </form>
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setModalIngressos(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.88rem', padding: '0.45rem 1.25rem' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}