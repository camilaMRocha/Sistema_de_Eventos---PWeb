import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Search, MapPin, Users, Maximize2, Tag, Calendar, Utensils, Sparkles, Music, Camera, Star } from 'lucide-react';

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
  const [locais, setLocais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cidade, setCidade] = useState('');
  const [capacidadeMin, setCapacidadeMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');

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

  useEffect(() => {
    carregarLocais();
  }, []);

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
      </main>
    </div>
  );
}