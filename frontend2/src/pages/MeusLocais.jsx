import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Building2, Plus, Edit2, Trash2, MapPin, Users, Maximize2, AlertCircle, CheckCircle, Search } from 'lucide-react';

export default function MeusLocais() {
  const { user } = useAuth();
  const [locais, setLocais] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const carregarLocais = async () => {
    if (!user?.id_perfil) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/locais/fornecedor/${user.id_perfil}`);
      setLocais(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar seus espaços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLocais();
  }, [user]);

  const handleExcluir = async (idLocal, nomeLocal) => {
    if (
      !window.confirm(
        `Tem certeza de que deseja excluir este espaço? Ele deixará de aparecer na vitrine e todas as fotos vinculadas serão removidas.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/locais/${idLocal}`);
      setMsg(`Local "${nomeLocal}" excluído com sucesso.`);
      setLocais((prev) => prev.filter((l) => l.id_local !== idLocal));
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Erro ao excluir local.');
    }
  };

  const locaisFiltrados = locais.filter((l) => {
    if (!filtroTexto.trim()) return true;
    const termo = filtroTexto.toLowerCase();
    const nome = (l.nome || '').toLowerCase();
    const cidade = (l.cidade || '').toLowerCase();
    return nome.includes(termo) || cidade.includes(termo);
  });

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '0.3rem' }}>
            Espaços e Locais Disponíveis
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Listagem dos espaços físicos para eventos cadastrados.
          </p>
        </div>

        <Link to="/locais/novo" className="btn btn-primary">
          <Plus size={18} />
          Cadastrar Local
        </Link>
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

      {/* Filtro em tempo real (fiel ao HTML original) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <label
          htmlFor="filtroLocal"
          style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}
        >
          Buscar em tempo real:
        </label>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <input
            type="text"
            id="filtroLocal"
            className="form-control"
            style={{ paddingLeft: '2.3rem' }}
            placeholder="Digite para filtrar por nome ou cidade..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Carregando seus locais...
        </div>
      ) : locaisFiltrados.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid var(--border)',
          }}
        >
          <Building2 size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--secondary)' }}>
            {filtroTexto.trim() ? 'Nenhum local encontrado na busca' : 'Nenhum local cadastrado'}
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            {filtroTexto.trim()
              ? 'Tente utilizar outros termos na barra de busca.'
              : 'Cadastre seu primeiro espaço para que clientes de todo o estado possam encontrar e alugar pela vitrine.'}
          </p>
          {!filtroTexto.trim() && (
            <Link to="/locais/novo" className="btn btn-primary">
              <Plus size={18} />
              Cadastrar Primeiro Espaço
            </Link>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome do Espaço</th>
                <th>Localização</th>
                <th>Capacidade</th>
                <th>Área</th>
                <th>Diária</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {locaisFiltrados.map((local) => (
                <tr key={local.id_local}>
                  <td>
                    <strong>{local.nome}</strong>
                    {local.descricao && (
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {local.descricao.slice(0, 60)}...
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="flex items-center gap-2">
                      <MapPin size={15} color="var(--primary)" />
                      {local.cidade} / {local.estado}
                    </span>
                  </td>
                  <td>
                    <span className="flex items-center gap-2">
                      <Users size={15} />
                      {local.capacidade} pessoas
                    </span>
                  </td>
                  <td>
                    <span className="flex items-center gap-2">
                      <Maximize2 size={15} />
                      {local.metragem} m²
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                      R$ {parseFloat(local.preco_diaria).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex gap-2 justify-end" style={{ justifyContent: 'flex-end' }}>
                      <Link
                        to={`/locais/editar/${local.id_local}`}
                        className="btn btn-sm btn-secondary"
                        title="Editar Espaço"
                      >
                        <Edit2 size={14} />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleExcluir(local.id_local, local.nome)}
                        className="btn btn-sm btn-outline-danger"
                        title="Excluir Espaço"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}