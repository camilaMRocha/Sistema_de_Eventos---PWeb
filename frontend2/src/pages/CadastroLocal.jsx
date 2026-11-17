import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Building2, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

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

export default function CadastroLocal() {
  const { id } = useParams();
  const isEditing = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Categorias disponíveis
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);

  // Campos do local
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [complemento, setComplemento] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [precoDiaria, setPrecoDiaria] = useState('');
  const [metragem, setMetragem] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quartos, setQuartos] = useState('0');
  const [banheiros, setBanheiros] = useState('0');
  const [vagasEstacionamento, setVagasEstacionamento] = useState('0');

  useEffect(() => {
    // Carregar todas as categorias para marcar quais o local atende
    api.get('/categorias')
      .then((cats) => {
        // Filtrar apenas subcategorias (que tem id_categoria_pai) para ser mais específico
        const subs = cats.filter((c) => c.id_categoria_pai !== null);
        setCategoriasDisponiveis(subs.length > 0 ? subs : cats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api.get(`/locais/${id}`)
        .then((l) => {
          setNome(l.nome);
          setCidade(l.cidade);
          setEstado(l.estado);
          setCapacidade(l.capacidade);
          setPrecoDiaria(l.preco_diaria);
          setMetragem(l.metragem);
          setDescricao(l.descricao || '');
          setQuartos(l.quartos || '0');
          setBanheiros(l.banheiros || '0');
          setVagasEstacionamento(l.vagas_estacionamento || '0');

          // Buscar dados complementares
          api.get(`/locais/fornecedor/${user.id_perfil}`).then((lista) => {
            const encontrado = lista.find((loc) => loc.id_local === parseInt(id, 10));
            if (encontrado) {
              setRua(encontrado.rua || '');
              setNumero(encontrado.numero || '');
              setBairro(encontrado.bairro || '');
              setCep(encontrado.cep || '');
              setComplemento(encontrado.complemento || '');
            }
          });
        })
        .catch((err) => setError(err.message || 'Erro ao carregar dados do local.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, user]);

  const toggleCategoria = (catId) => {
    if (categoriasSelecionadas.includes(catId)) {
      setCategoriasSelecionadas(categoriasSelecionadas.filter((c) => c !== catId));
    } else {
      setCategoriasSelecionadas([...categoriasSelecionadas, catId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!capacidade || parseInt(capacidade, 10) <= 0) {
      setError('A capacidade do espaço deve ser maior que zero.');
      return;
    }

    if (!precoDiaria || parseFloat(precoDiaria) <= 0) {
      setError('Informe um valor de diária válido.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome,
        cidade,
        estado,
        rua: rua || 'Não informado',
        numero: numero || 'S/N',
        bairro: bairro || 'Centro',
        cep: cep || '00000-000',
        complemento: complemento || null,
        capacidade: parseInt(capacidade, 10),
        preco_diaria: parseFloat(precoDiaria),
        metragem: parseFloat(metragem || 0),
        descricao: descricao || null,
        quartos: parseInt(quartos, 10) || 0,
        banheiros: parseInt(banheiros, 10) || 0,
        vagas_estacionamento: parseInt(vagasEstacionamento, 10) || 0,
        categorias_ids: categoriasSelecionadas.length > 0 ? categoriasSelecionadas : null,
      };

      if (isEditing) {
        await api.put(`/locais/${id}`, payload);
        setSuccess('Local atualizado com sucesso!');
      } else {
        payload.id_fornecedor = user.id_perfil;
        await api.post('/locais', payload);
        setSuccess('Local cadastrado com sucesso!');
      }

      setTimeout(() => {
        navigate('/meus-locais');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Erro ao salvar local.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div className="form-card">
        <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--secondary)' }}>
              {isEditing ? 'Editar Espaço' : 'Cadastrar Novo Espaço'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Disponibilize seu salão, chácara ou sítio para locação na vitrine da plataforma.
            </p>
          </div>

          <Link to="/meus-locais" className="btn btn-sm btn-secondary">
            <ArrowLeft size={16} />
            Voltar
          </Link>
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome do Espaço / Salão *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Ex: Recanto das Palmeiras, Espaço Nobre VIP..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Capacidade Máxima (Pessoas) *</label>
              <input
                type="number"
                required
                min="1"
                className="form-control"
                placeholder="Ex: 250"
                value={capacidade}
                onChange={(e) => setCapacidade(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valor da Diária (R$) *</label>
              <input
                type="number"
                required
                min="0"
                step="50"
                className="form-control"
                placeholder="Ex: 1200.00"
                value={precoDiaria}
                onChange={(e) => setPrecoDiaria(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Área Total (m²) *</label>
              <input
                type="number"
                required
                min="10"
                className="form-control"
                placeholder="Ex: 800"
                value={metragem}
                onChange={(e) => setMetragem(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quartos / Suítes</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={quartos}
                onChange={(e) => setQuartos(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Banheiros</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={banheiros}
                onChange={(e) => setBanheiros(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vagas de Garagem</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={vagasEstacionamento}
                onChange={(e) => setVagasEstacionamento(e.target.value)}
              />
            </div>
          </div>

          {/* Localização */}
          <h4 style={{ color: 'var(--secondary)', margin: '1.5rem 0 1rem 0', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
            Localização do Imóvel
          </h4>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Cidade *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Ex: Mogi Guaçu"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Estado (UF) *</label>
              <input
                type="text"
                required
                maxLength="2"
                className="form-control"
                placeholder="SP"
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">CEP</label>
              <input
                type="text"
                className="form-control"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Rua / Logradouro</label>
              <input
                type="text"
                className="form-control"
                placeholder="Avenida / Rua"
                value={rua}
                onChange={(e) => setRua(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Número</label>
              <input
                type="text"
                className="form-control"
                placeholder="100"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>
          </div>

          {/* Categorias atendidas */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Tipos de Eventos Atendidos</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.5rem',
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid var(--border)',
                padding: '0.75rem',
                borderRadius: '6px',
              }}
            >
              {categoriasDisponiveis.map((c) => (
                <label key={c.id_categoria} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={categoriasSelecionadas.includes(c.id_categoria)}
                    onChange={() => toggleCategoria(c.id_categoria)}
                  />
                  <span>{sanitizarTexto(c.nome_categoria)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição e Diferenciais do Espaço</label>
            <textarea
              rows="3"
              className="form-control"
              placeholder="Descreva a estrutura (piscina, churrasqueira, pista de dança, climatização)..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            ></textarea>
          </div>

          <div className="flex gap-3" style={{ marginTop: '2rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              <Save size={18} />
              {loading ? 'Salvando...' : isEditing ? 'Atualizar Local' : 'Cadastrar Local'}
            </button>
            <Link to="/meus-locais" className="btn btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
