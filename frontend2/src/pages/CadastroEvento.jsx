import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Calendar, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

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

export default function CadastroEvento() {
  const { id } = useParams();
  const isEditing = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Categorias
  const [tipos, setTipos] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [tipoPaiSelecionado, setTipoPaiSelecionado] = useState('');

  // Campos do evento
  const [nomeEvento, setNomeEvento] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [formato, setFormato] = useState('Presencial');
  const [visibilidade, setVisibilidade] = useState('Privado');
  const [dataHoraInicio, setDataHoraInicio] = useState('');
  const [dataHoraTermino, setDataHoraTermino] = useState('');
  const [descricaoEvento, setDescricaoEvento] = useState('');
  const [orcamentoEstimado, setOrcamentoEstimado] = useState('');

  // Carregar tipos de categorias principais
  useEffect(() => {
    api.get('/categorias/tipos')
      .then(setTipos)
      .catch((err) => setError('Erro ao carregar tipos de eventos.'));
  }, []);

  // Carregar subcategorias ao mudar o tipo pai
  useEffect(() => {
    if (tipoPaiSelecionado) {
      api.get(`/categorias/subcategorias/${tipoPaiSelecionado}`)
        .then((subs) => {
          setSubcategorias(subs);
          if (subs.length > 0 && !idCategoria) {
            setIdCategoria(subs[0].id_categoria);
          }
        })
        .catch(() => setSubcategorias([]));
    } else {
      setSubcategorias([]);
    }
  }, [tipoPaiSelecionado]);

  // Se estiver editando, carregar dados do evento
  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api.get(`/eventos/${id}`)
        .then((ev) => {
          setNomeEvento(ev.nome_evento);
          setFormato(ev.formato || 'Presencial');
          setVisibilidade(ev.visibilidade || 'Privado');
          setDescricaoEvento(ev.descricao_evento || '');
          setOrcamentoEstimado(ev.orcamento_estimado || '');

          // Formatar datas para datetime-local (YYYY-MM-DDTHH:mm)
          if (ev.data_hora_inicio) {
            setDataHoraInicio(ev.data_hora_inicio.slice(0, 16));
          }
          if (ev.data_hora_termino) {
            setDataHoraTermino(ev.data_hora_termino.slice(0, 16));
          }

          if (ev.id_categoria) {
            setIdCategoria(ev.id_categoria);
            // Buscar detalhes da hierarquia para pré-selecionar o tipo pai
            api.get('/categorias/hierarquia').then((hierarquia) => {
              const cat = hierarquia.find((c) => c.id_categoria === ev.id_categoria);
              if (cat && cat.id_categoria_pai) {
                setTipoPaiSelecionado(cat.id_categoria_pai);
              }
            });
          }
        })
        .catch((err) => setError(err.message || 'Erro ao carregar evento para edição.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (new Date(dataHoraTermino) <= new Date(dataHoraInicio)) {
      setError('A data e horário de término devem ser posteriores ao início.');
      return;
    }

    if (!idCategoria) {
      setError('Selecione uma categoria válida para o evento.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome_evento: nomeEvento,
        id_categoria: parseInt(idCategoria, 10),
        formato,
        visibilidade,
        data_hora_inicio: dataHoraInicio,
        data_hora_termino: dataHoraTermino,
        descricao_evento: descricaoEvento || null,
        orcamento_estimado: orcamentoEstimado ? parseFloat(orcamentoEstimado) : 0.0,
      };

      if (isEditing) {
        await api.put(`/eventos/${id}`, payload);
        setSuccess('Evento atualizado com sucesso!');
      } else {
        payload.id_cliente = user.id_perfil;
        await api.post('/eventos', payload);
        setSuccess('Evento cadastrado com sucesso!');
      }

      setTimeout(() => {
        navigate('/meus-eventos');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Erro ao salvar evento.');
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
              {isEditing ? 'Editar Evento' : 'Novo Evento'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Preencha os dados do seu evento para poder planejar e solicitar orçamentos.
            </p>
          </div>

          <Link to="/meus-eventos" className="btn btn-sm btn-secondary">
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
            <label className="form-label">Nome do Evento *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Ex: Aniversário Sunset 2026, Casamento dos Sonhos..."
              value={nomeEvento}
              onChange={(e) => setNomeEvento(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo do Evento (Principal) *</label>
              <select
                required
                className="form-select"
                value={tipoPaiSelecionado}
                onChange={(e) => setTipoPaiSelecionado(e.target.value)}
              >
                <option value="">Selecione o tipo principal</option>
                {tipos.map((t) => (
                  <option key={t.id_categoria} value={t.id_categoria}>
                    {sanitizarTexto(t.nome_categoria)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subcategoria *</label>
              <select
                required
                disabled={!tipoPaiSelecionado || subcategorias.length === 0}
                className="form-select"
                value={idCategoria}
                onChange={(e) => setIdCategoria(e.target.value)}
              >
                <option value="">Selecione a subcategoria</option>
                {subcategorias.map((s) => (
                  <option key={s.id_categoria} value={s.id_categoria}>
                    {sanitizarTexto(s.nome_categoria)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Formato do Evento *</label>
              <select
                className="form-select"
                value={formato}
                onChange={(e) => setFormato(e.target.value)}
              >
                <option value="Presencial">Presencial</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Visibilidade *</label>
              <select
                className="form-select"
                value={visibilidade}
                onChange={(e) => setVisibilidade(e.target.value)}
              >
                <option value="Privado">Privado (Apenas convidados)</option>
                <option value="Publico">Público (Aberto)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data e Horário de Início *</label>
              <input
                type="datetime-local"
                required
                className="form-control"
                value={dataHoraInicio}
                onChange={(e) => setDataHoraInicio(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data e Horário de Término *</label>
              <input
                type="datetime-local"
                required
                className="form-control"
                value={dataHoraTermino}
                onChange={(e) => setDataHoraTermino(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição do Evento</label>
            <textarea
              rows="3"
              className="form-control"
              placeholder="Descreva a temática, atrações e informações importantes..."
              value={descricaoEvento}
              onChange={(e) => setDescricaoEvento(e.target.value)}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Orçamento Estimado (R$)</label>
            <input
              type="number"
              min="0"
              step="50"
              className="form-control"
              placeholder="Ex: 5000.00"
              value={orcamentoEstimado}
              onChange={(e) => setOrcamentoEstimado(e.target.value)}
            />
          </div>

          <div className="flex gap-3" style={{ marginTop: '2rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              <Save size={18} />
              {loading ? 'Salvando...' : isEditing ? 'Atualizar Evento' : 'Cadastrar Evento'}
            </button>
            <Link to="/meus-eventos" className="btn btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
