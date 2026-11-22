import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Search,
  MapPin,
  Users,
  Maximize2,
  Tag,
  Calendar,
  Utensils,
  Sparkles,
  Music,
  Camera,
  Star,
  Ticket,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  QrCode,
  Copy,
  Check,
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

export default function Home() {
  const { user, isCliente } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('espacos');

  const [locais, setLocais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [filtroEvento, setFiltroEvento] = useState('');

  const [cidade, setCidade] = useState('');
  const [capacidadeMin, setCapacidadeMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');

  const [modalCompra, setModalCompra] = useState(null);
  const [lotesEvento, setLotesEvento] = useState([]);
  const [loteSelecionado, setLoteSelecionado] = useState(null);
  const [quantidadeCompra, setQuantidadeCompra] = useState(1);
  const [metodoPagamentoCompra, setMetodoPagamentoCompra] = useState('Pix');
  const [carregandoLotes, setCarregandoLotes] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [erroCompra, setErroCompra] = useState('');
  const [sucessoCompra, setSucessoCompra] = useState(null);
  const [pixCopiado, setPixCopiado] = useState(false);

  const [numCartao, setNumCartao] = useState('4532 1234 5678 9012');
  const [titularCartao, setTitularCartao] = useState('CLIENTE HEYEVENTS');
  const [validadeCartao, setValidadeCartao] = useState('12/28');
  const [cvvCartao, setCvvCartao] = useState('123');

  const carregarLocais = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (cidade.trim()) params.append('cidade', cidade.trim());
      if (capacidadeMin) params.append('capacidade_min', capacidadeMin);
      if (precoMax) params.append('preco_max', precoMax);

      const query = params.toString() ? `?${params.toString()}` : '';
      const dados = await api.get(`/locais${query}`);
      setLocais(dados);
    } catch (err) {
      setError(err.message || 'Erro ao carregar locais');
    } finally {
      setLoading(false);
    }
  };

  const carregarEventos = async () => {
    setLoadingEventos(true);
    try {
      const dados = await api.get('/eventos/publicos/busca');
      setEventos(dados);
    } catch {
      setEventos([]);
    } finally {
      setLoadingEventos(false);
    }
  };

  useEffect(() => {
    carregarLocais();
    carregarEventos();
  }, []);

  const abrirModalCompra = async (evento) => {
    setModalCompra(evento);
    setLotesEvento([]);
    setLoteSelecionado(null);
    setQuantidadeCompra(1);
    setMetodoPagamentoCompra('Pix');
    setErroCompra('');
    setSucessoCompra(null);
    setCarregandoLotes(true);

    try {
      const lotes = await api.get(`/ingressos/evento/${evento.id_evento}`);
      setLotesEvento(lotes);
      const disponivel = lotes.find((l) => Number(l.quantidade_disponivel) > 0);
      setLoteSelecionado(disponivel || null);
    } catch (err) {
      setErroCompra(err.message || 'Erro ao carregar lotes de ingressos.');
    } finally {
      setCarregandoLotes(false);
    }
  };

  const handleComprarIngresso = async (e) => {
    e.preventDefault();
    const idCliente = user?.id_perfil || user?.id_cliente;
    if (!loteSelecionado || !idCliente) return;
    setComprando(true);
    setErroCompra('');
    try {
      const payload = {
        id_ingresso: loteSelecionado.id_ingresso,
        id_cliente: idCliente,
        quantidade: parseInt(quantidadeCompra, 10),
        metodo_pagamento: Number(loteSelecionado.preco) === 0 ? 'Gratuito' : metodoPagamentoCompra,
      };
      const resultado = await api.post('/ingressos/comprar', payload);
      setSucessoCompra(resultado);
      await carregarEventos();
    } catch (err) {
      setErroCompra(err.message || 'Erro ao processar compra de ingresso.');
    } finally {
      setComprando(false);
    }
  };

  const copiarPix = () => {
    const mockHash = '00020126580014BR.GOV.BCB.PIX0136heyevents-ingressos-venda5204000053039865802BR5925HEYEVENTS INGRESSOS6009CAMPINAS62070503***6304C9F1';
    navigator.clipboard.writeText(mockHash);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 3000);
  };

  const formatarData = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const eventosFiltrados = eventos.filter((ev) => {
    if (!filtroEvento.trim()) return true;
    const termo = filtroEvento.toLowerCase();
    const nome = (ev.nome_evento || '').toLowerCase();
    const cat = (ev.subcategoria || '').toLowerCase();
    const loc = (ev.nome_local || '').toLowerCase();
    const cid = (ev.cidade || '').toLowerCase();
    return nome.includes(termo) || cat.includes(termo) || loc.includes(termo) || cid.includes(termo);
  });

  const handleSearch = (e) => {
    e.preventDefault();
    carregarLocais();
  };

  const limparFiltros = () => {
    setCidade('');
    setCapacidadeMin('');
    setPrecoMax('');
    setTimeout(() => {
      api.get('/locais').then(setLocais).catch(() => {});
    }, 0);
  };

  return (
    <div>
      <header className="hero-section text-center">
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <h1 className="hero-title" style={{ color: '#ffffff', marginBottom: '0.8rem' }}>
              Encontre o espaço ideal para o seu evento
            </h1>
            <p className="hero-subtitle" style={{ color: '#cbd5e1', marginBottom: '1.8rem', fontSize: '1.1rem' }}>
              Chácaras, salões de festas, sítios e auditórios para casamentos, aniversários e confraternizações.
            </p>

            <form onSubmit={handleSearch} className="search-box">
              <div>
                <label className="form-label" style={{ marginBottom: '0.2rem', color: '#e2e8f0' }}>
                  Cidade
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Em qual cidade você deseja realizar seu evento?"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '0.2rem', color: '#e2e8f0' }}>
                  Capacidade Mínima
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Mínimo de pessoas"
                  min="0"
                  value={capacidadeMin}
                  onChange={(e) => setCapacidadeMin(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '0.2rem', color: '#e2e8f0' }}>
                  Diária Máxima (R$)
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Até R$"
                  min="0"
                  step="50"
                  value={precoMax}
                  onChange={(e) => setPrecoMax(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
                  <Search size={18} />
                  Pesquisar
                </button>
                {(cidade || capacidadeMin || precoMax) && (
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="btn btn-secondary"
                    style={{ height: '42px' }}
                  >
                    Limpar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0 2.5rem 0' }}>
          <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '5px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
            <button
              type="button"
              onClick={() => setAbaAtiva('espacos')}
              style={{
                padding: '0.65rem 1.75rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: abaAtiva === 'espacos' ? '#ffffff' : 'transparent',
                color: abaAtiva === 'espacos' ? 'var(--primary)' : '#64748b',
                boxShadow: abaAtiva === 'espacos' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
            >
              <MapPin size={18} />
              Espaços para Locação ({locais.length})
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva('eventos')}
              style={{
                padding: '0.65rem 1.75rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: abaAtiva === 'eventos' ? '#ffffff' : 'transparent',
                color: abaAtiva === 'eventos' ? 'var(--primary)' : '#64748b',
                boxShadow: abaAtiva === 'eventos' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Ticket size={18} />
              Eventos & Ingressos ({eventos.length})
            </button>
          </div>
        </div>

        {abaAtiva === 'espacos' ? (
          <section id="secaoEspacos" style={{ marginBottom: '3.5rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--secondary)', marginBottom: '0.2rem' }}>
                  Espaços em Destaque
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Descubra os melhores locais disponíveis para locação.
                </p>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {locais.length} {locais.length === 1 ? 'local encontrado' : 'locais encontrados'}
              </span>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                Carregando catálogo de locais...
              </div>
            ) : locais.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 0',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}
              >
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Nenhum espaço encontrado com os filtros selecionados.
                </p>
                <button onClick={limparFiltros} className="btn btn-outline-primary">
                  Ver todos os locais
                </button>
              </div>
            ) : (
              <div className="cards-grid">
                {locais.map((local) => {
                  const fotos = local.fotos_urls || [];
                  const fotoCapa = fotos.length > 0 ? fotos[0] : null;

                  return (
                    <div key={local.id_local} className="card">
                      <div className="card-img-wrapper">
                        {fotoCapa ? (
                          <img src={fotoCapa} alt={local.nome} className="card-img" />
                        ) : (
                          <div className="card-img-placeholder">
                            <Tag size={24} style={{ marginRight: '0.4rem', opacity: 0.6 }} />
                            {local.nome}
                          </div>
                        )}
                      </div>

                      <div className="card-body">
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.2rem' }}>
                          <h3 className="card-title" style={{ margin: 0 }}>{local.nome}</h3>
                          {local.total_avaliacoes > 0 ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                              }}
                              title={`Média de ${Number(local.nota_media).toFixed(1)} estrelas em ${local.total_avaliacoes} avaliações`}
                            >
                              <Star size={13} fill="#f59e0b" color="#f59e0b" />
                              <span>{Number(local.nota_media).toFixed(1)}</span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#b45309' }}>
                                ({local.total_avaliacoes})
                              </span>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                backgroundColor: '#f1f5f9',
                                color: '#64748b',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                              }}
                              title="Espaço novo, ainda sem avaliações"
                            >
                              <Star size={12} color="#94a3b8" />
                              <span>Novo</span>
                            </div>
                          )}
                        </div>

                        <div className="card-meta">
                          <MapPin size={16} color="var(--primary)" />
                          <span>{local.cidade} / {local.estado}</span>
                        </div>

                        <div className="card-details">
                          <span className="flex items-center gap-2" title="Capacidade total">
                            <Users size={16} />
                            {local.capacidade} pessoas
                          </span>
                          <span className="flex items-center gap-2" title="Área total">
                            <Maximize2 size={16} />
                            {local.metragem} m²
                          </span>
                        </div>

                        {local.categorias && (
                          <div style={{ margin: '0.5rem 0 1rem 0', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {local.categorias.split(',').map((cat, idx) => (
                              <span key={idx} className="badge badge-tag">
                                {sanitizarTexto(cat.trim())}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between" style={{ marginTop: 'auto' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Diária</span>
                            <div className="card-price">
                              R$ {parseFloat(local.preco_diaria).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          <Link to={`/reserva/${local.id_local}`} className="btn btn-primary btn-sm">
                            <Calendar size={15} />
                            Alugar Espaço
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section id="secaoEventos" style={{ marginBottom: '3.5rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--secondary)', marginBottom: '0.2rem' }}>
                  Próximos Eventos & Ingressos
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Encontre eventos públicos e garanta seu ingresso com facilidade.
                </p>
              </div>

              <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.88rem' }}
                  placeholder="Filtrar eventos ou cidades..."
                  value={filtroEvento}
                  onChange={(e) => setFiltroEvento(e.target.value)}
                />
              </div>
            </div>

            {loadingEventos ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                Carregando eventos públicos...
              </div>
            ) : eventosFiltrados.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 0',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}
              >
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Nenhum evento público encontrado no momento.
                </p>
              </div>
            ) : (
              <div className="cards-grid">
                {eventosFiltrados.map((ev) => {
                  const catNome = sanitizarTexto(ev.subcategoria);
                  const tipoNome = sanitizarTexto(ev.tipo_evento);
                  const categoriaTexto = tipoNome ? `${tipoNome} - ${catNome}` : catNome || 'Geral';
                  const temIngressos = ev.total_lotes_ingresso > 0;
                  const totalDisponivel = ev.total_ingressos_disponiveis !== undefined && ev.total_ingressos_disponiveis !== null ? Number(ev.total_ingressos_disponiveis) : null;
                  const esgotado = temIngressos && totalDisponivel !== null && totalDisponivel <= 0;
                  const gratuito = ev.possui_gratuito > 0 && !ev.menor_preco_ingresso;
                  const aPartirDe = esgotado
                    ? 'Ingressos Esgotados'
                    : ev.menor_preco_ingresso
                    ? `A partir de R$ ${Number(ev.menor_preco_ingresso).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : gratuito
                    ? 'Entrada Gratuita'
                    : 'Ingressos em breve';

                  return (
                    <div key={ev.id_evento} className="card">
                      <div className="card-body">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.6rem' }}>
                          <span
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: '#1e293b',
                              border: '1px solid #cbd5e1',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {categoriaTexto}
                          </span>
                          <span
                            style={{
                              backgroundColor: '#0ea5e9',
                              color: '#ffffff',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {ev.formato || 'Presencial'}
                          </span>
                        </div>

                        <h3 className="card-title" style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                          {ev.nome_evento}
                        </h3>

                        <p style={{ color: '#64748b', fontSize: '0.84rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                          {ev.descricao_evento || 'Sem descrição detalhada informada.'}
                        </p>

                        <div className="card-meta" style={{ marginBottom: '0.35rem' }}>
                          <Calendar size={15} color="var(--primary)" />
                          <span style={{ fontSize: '0.82rem' }}>
                            {formatarData(ev.data_hora_inicio)}
                          </span>
                        </div>

                        <div className="card-meta" style={{ marginBottom: '0.75rem' }}>
                          <MapPin size={15} color="var(--primary)" />
                          <span style={{ fontSize: '0.82rem' }}>
                            {ev.nome_local ? `${ev.nome_local} • ${ev.cidade || ''}/${ev.estado || ''}` : 'Local presencial'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1rem' }}>
                          Organizado por <strong>{ev.organizador}</strong>
                        </div>

                        <div className="flex items-center justify-between" style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Ingresso</span>
                            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: esgotado ? '#ef4444' : gratuito ? '#16a34a' : 'var(--primary)' }}>
                              {aPartirDe}
                            </div>
                          </div>

                          {esgotado ? (
                            <button
                              type="button"
                              disabled
                              className="btn btn-sm btn-secondary"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', opacity: 0.65, cursor: 'not-allowed' }}
                              title="Todos os ingressos deste evento foram esgotados"
                            >
                              <Ticket size={14} />
                              Esgotado
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => abrirModalCompra(ev)}
                              disabled={!temIngressos}
                              className={`btn btn-sm ${temIngressos ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Ticket size={14} />
                              {temIngressos ? 'Garantir Ingresso' : 'Em Breve'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section id="secaoServicos" style={{ margin: '3.5rem 0', paddingTop: '2.5rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--secondary)', marginBottom: '0.3rem' }}>
              Serviços Completos para seu Evento
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Conecte-se com fornecedores qualificados para cada detalhe da sua celebração.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center' }}>
              <Utensils size={32} color="var(--primary)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.4rem', fontSize: '1.05rem' }}>
                Buffet e Gastronomia
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Cardápios personalizados para casamentos, jantares e aniversários.
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center' }}>
              <Sparkles size={32} color="var(--primary)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.4rem', fontSize: '1.05rem' }}>
                Decoração e Cenografia
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Projetos visuais e ambientação para temas clássicos e modernos.
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center' }}>
              <Music size={32} color="var(--primary)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.4rem', fontSize: '1.05rem' }}>
                Som, Iluminação e DJ
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Estrutura audiovisual profissional para pistas de dança e cerimônias.
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center' }}>
              <Camera size={32} color="var(--primary)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.4rem', fontSize: '1.05rem' }}>
                Fotografia e Filmagem
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Registro profissional de cada instante marcante do seu evento.
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            margin: '3rem 0 1rem 0',
            padding: '3rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <h3 style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
            Você possui um espaço para festas ou presta serviços?
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            Cadastre-se como fornecedor parceiro no HeyEvents e divulgue para clientes da sua região.
          </p>
          <Link to="/cadastro" className="btn btn-primary" style={{ padding: '0.65rem 1.75rem' }}>
            Quero Divulgar Meu Espaço
          </Link>
        </section>

        {modalCompra && (
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
                maxWidth: '540px',
                width: '100%',
                padding: '1.75rem',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Ticket size={22} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', fontWeight: 700, margin: 0 }}>
                    Garantir Ingressos
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalCompra(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b', fontWeight: 700 }}>
                  {modalCompra.nome_evento}
                </h4>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  {formatarData(modalCompra.data_hora_inicio)} &bull; {modalCompra.nome_local || 'Local a confirmar'}
                </p>
              </div>

              {!user ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                    Para comprar ingressos e receber seu comprovante digital, acesse ou crie sua conta de cliente.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                      Entrar na Conta
                    </Link>
                    <Link to="/cadastro" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
                      Criar Cadastro
                    </Link>
                  </div>
                </div>
              ) : (!isCliente && user.tipo_usuario !== 'Cliente') ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1rem' }}>
                    A compra de ingressos é exclusiva para contas de clientes. Conecte-se com seu perfil de cliente para finalizar a compra.
                  </div>
                  <button type="button" onClick={() => setModalCompra(null)} className="btn btn-secondary">
                    Fechar
                  </button>
                </div>
              ) : sucessoCompra ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <CheckCircle size={52} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#166534', marginBottom: '0.35rem' }}>
                    Ingresso Garantido com Sucesso!
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                    Sua compra foi confirmada e vinculada à sua conta.
                  </p>

                  <div style={{ backgroundColor: '#f1f5f9', border: '1px dashed #94a3b8', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Código do Ingresso:</div>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                      {sucessoCompra.codigo_ingresso}
                    </strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.5rem' }}>
                      Lote: <strong>{sucessoCompra.titulo_ingresso || loteSelecionado?.titulo_ingresso}</strong> &bull; Quantidade: <strong>{sucessoCompra.quantidade}</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Valor Total: <strong style={{ color: '#16a34a' }}>R$ {Number(sucessoCompra.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <Link to="/meus-ingressos" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                      Ver em Meus Ingressos
                    </Link>
                    <button type="button" onClick={() => setModalCompra(null)} className="btn btn-secondary">
                      Fechar
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleComprarIngresso}>
                  {erroCompra && (
                    <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                      <AlertCircle size={18} />
                      <span>{erroCompra}</span>
                    </div>
                  )}

                  {carregandoLotes ? (
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.88rem', margin: '2rem 0' }}>
                      Carregando lotes de ingressos...
                    </p>
                  ) : lotesEvento.length > 0 && lotesEvento.every((l) => (l.quantidade_disponivel || 0) <= 0) ? (
                    <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
                      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.35rem' }}>
                          Ingressos Esgotados
                        </div>
                        <p style={{ color: '#b91c1c', fontSize: '0.88rem', margin: 0 }}>
                          Todos os ingressos deste evento já foram adquiridos. Fique atento a novas aberturas de lotes pelo organizador.
                        </p>
                      </div>

                      <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600, textAlign: 'left', display: 'block' }}>
                          Lotes Encerrados
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {lotesEvento.map((lote) => (
                            <div
                              key={lote.id_ingresso}
                              style={{
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem',
                                opacity: 0.7,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div style={{ textAlign: 'left' }}>
                                <strong style={{ color: '#1e293b', fontSize: '0.92rem' }}>
                                  {lote.titulo_ingresso || lote.titulo}
                                </strong>
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                                  ({lote.tipo_ingresso})
                                </span>
                                <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.15rem' }}>
                                  Lote esgotado
                                </div>
                              </div>
                              <strong style={{ fontSize: '0.95rem', color: '#64748b' }}>
                                {Number(lote.preco) === 0 ? 'Gratuito' : Number(lote.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                          type="button"
                          onClick={() => setModalCompra(null)}
                          className="btn btn-secondary"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  ) : lotesEvento.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                      Nenhum lote de ingressos disponível para venda neste momento.
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                          Selecione o Lote / Categoria
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {lotesEvento.map((lote) => {
                            const selecionado = loteSelecionado?.id_ingresso === lote.id_ingresso;
                            const esgotado = (lote.quantidade_disponivel || 0) <= 0;
                            const precoTexto = Number(lote.preco) === 0 ? 'Gratuito' : Number(lote.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                            return (
                              <div
                                key={lote.id_ingresso}
                                onClick={() => {
                                  if (!esgotado) setLoteSelecionado(lote);
                                }}
                                style={{
                                  border: selecionado ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                                  backgroundColor: selecionado ? '#f0fdf4' : esgotado ? '#f8fafc' : '#ffffff',
                                  borderRadius: '8px',
                                  padding: '0.75rem 1rem',
                                  cursor: esgotado ? 'not-allowed' : 'pointer',
                                  opacity: esgotado ? 0.6 : 1,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <div>
                                  <strong style={{ color: '#1e293b', fontSize: '0.92rem' }}>
                                    {lote.titulo_ingresso || lote.titulo}
                                  </strong>
                                  <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                                    ({lote.tipo_ingresso})
                                  </span>
                                  <div style={{ fontSize: '0.78rem', color: esgotado ? '#ef4444' : '#16a34a', marginTop: '0.15rem' }}>
                                    {esgotado ? 'Lote esgotado' : `${lote.quantidade_disponivel} restantes`}
                                  </div>
                                </div>
                                <strong style={{ fontSize: '1rem', color: Number(lote.preco) === 0 ? '#16a34a' : 'var(--primary)' }}>
                                  {precoTexto}
                                </strong>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {loteSelecionado && Number(loteSelecionado.quantidade_disponivel) > 0 ? (
                        <>
                          <div style={{ marginBottom: '1.25rem' }}>
                            <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                              Quantidade de Ingressos
                            </label>
                            <select
                              className="form-control"
                              value={quantidadeCompra}
                              onChange={(e) => setQuantidadeCompra(parseInt(e.target.value, 10))}
                              style={{ fontSize: '0.88rem' }}
                            >
                              {Array.from(
                                { length: Math.min(loteSelecionado.quantidade_max_compra ?? 5, loteSelecionado.quantidade_disponivel) },
                                (_, i) => i + 1
                              ).map((n) => (
                                <option key={n} value={n}>
                                  {n} {n === 1 ? 'ingresso' : 'ingressos'}
                                </option>
                              ))}
                            </select>
                          </div>

                          {Number(loteSelecionado.preco) > 0 && (
                            <div style={{ marginBottom: '1.25rem' }}>
                              <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                                Forma de Pagamento
                              </label>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setMetodoPagamentoCompra('Pix')}
                                  style={{
                                    border: metodoPagamentoCompra === 'Pix' ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                                    backgroundColor: metodoPagamentoCompra === 'Pix' ? '#f0fdf4' : '#ffffff',
                                    borderRadius: '8px',
                                    padding: '0.6rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.4rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                  }}
                                >
                                  <QrCode size={16} />
                                  Pix
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMetodoPagamentoCompra('Cartao de Credito')}
                                  style={{
                                    border: metodoPagamentoCompra === 'Cartao de Credito' ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                                    backgroundColor: metodoPagamentoCompra === 'Cartao de Credito' ? '#f0fdf4' : '#ffffff',
                                    borderRadius: '8px',
                                    padding: '0.6rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.4rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                  }}
                                >
                                  <CreditCard size={16} />
                                  Cartão
                                </button>
                              </div>

                              {metodoPagamentoCompra === 'Pix' ? (
                                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.4rem' }}>
                                    Copie a chave Pix para pagamento instantâneo:
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                      type="text"
                                      readOnly
                                      value="00020126580014BR.GOV.BCB.PIX0136heyevents-ingressos-venda5204000053039865802BR5925HEYEVENTS INGRESSOS6009CAMPINAS62070503***6304C9F1"
                                      className="form-control"
                                      style={{ fontSize: '0.78rem', backgroundColor: '#ffffff' }}
                                    />
                                    <button
                                      type="button"
                                      onClick={copiarPix}
                                      className="btn btn-secondary"
                                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                    >
                                      {pixCopiado ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                                      {pixCopiado ? 'Copiado!' : 'Copiar'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                  <div style={{ marginBottom: '0.5rem' }}>
                                    <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Número do Cartão</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={numCartao}
                                      onChange={(e) => setNumCartao(e.target.value)}
                                      style={{ fontSize: '0.82rem' }}
                                    />
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.4rem' }}>
                                    <div>
                                      <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Titular</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={titularCartao}
                                        onChange={(e) => setTitularCartao(e.target.value)}
                                        style={{ fontSize: '0.82rem' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Validade</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={validadeCartao}
                                        onChange={(e) => setValidadeCartao(e.target.value)}
                                        style={{ fontSize: '0.82rem' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>CVV</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={cvvCartao}
                                        onChange={(e) => setCvvCartao(e.target.value)}
                                        style={{ fontSize: '0.82rem' }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ backgroundColor: '#f1f5f9', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.92rem', color: '#475569', fontWeight: 600 }}>Total a Pagar:</span>
                            <strong style={{ fontSize: '1.25rem', color: Number(loteSelecionado.preco) === 0 ? '#16a34a' : 'var(--primary)' }}>
                              {Number(loteSelecionado.preco) === 0
                                ? 'Gratuito'
                                : (Number(loteSelecionado.preco) * quantidadeCompra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </strong>
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => setModalCompra(null)}
                              className="btn btn-secondary"
                              disabled={comprando}
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={comprando || (loteSelecionado.quantidade_disponivel || 0) <= 0}
                              style={{ minWidth: '160px' }}
                            >
                              {comprando ? 'Processando...' : Number(loteSelecionado.preco) === 0 ? 'Garantir Ingresso Gratuito' : 'Confirmar Compra'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1rem 0' }}>
                            Selecione um lote disponível acima para continuar com a compra.
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => setModalCompra(null)}
                              className="btn btn-secondary"
                            >
                              Fechar
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}