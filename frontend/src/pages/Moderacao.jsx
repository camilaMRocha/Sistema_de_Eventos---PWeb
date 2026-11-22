import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ShieldCheck, Star, Trash2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function Moderacao() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [moderandoId, setModerandoId] = useState(null);

  const carregarAvaliacoes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/avaliacoes');
      setAvaliacoes(data || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar avaliações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAvaliacoes();
  }, []);

  const handleModerar = async (idAvaliacao) => {
    if (!window.confirm('Tem certeza de que deseja remover o comentário desta avaliação? A nota em estrelas será mantida.')) {
      return;
    }

    setModerandoId(idAvaliacao);
    setError('');
    setSuccess('');

    try {
      await api.put(`/avaliacoes/${idAvaliacao}/moderar-comentario`);
      setSuccess('Comentário removido com sucesso.');
      await carregarAvaliacoes();
    } catch (err) {
      setError(err.message || 'Erro ao remover comentário.');
    } finally {
      setModerandoId(null);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <ShieldCheck size={28} color="var(--primary)" />
            <h1 style={{ fontSize: '1.75rem', color: 'var(--secondary)', margin: 0 }}>
              Página de Administração
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Gerenciamento e moderação de comentários da plataforma.
          </p>
        </div>

        <button
          onClick={carregarAvaliacoes}
          disabled={loading}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Carregando avaliações da plataforma...
        </div>
      ) : avaliacoes.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
            Nenhuma avaliação encontrada na plataforma até o momento.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {avaliacoes.map((item) => {
            const temComentario = Boolean(item.comentario && item.comentario.trim());

            return (
              <div
                key={item.id_avaliacao}
                className="form-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--secondary)' }}>
                        {item.nome_cliente || 'Cliente'}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {item.data_avaliacao ? new Date(item.data_avaliacao).toLocaleDateString('pt-BR') : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= item.nota ? '#eab308' : 'none'}
                          color={star <= item.nota ? '#eab308' : '#cbd5e1'}
                        />
                      ))}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '0.35rem', color: 'var(--secondary)' }}>
                        {item.nota}.0
                      </span>
                      {item.id_reserva && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          Reserva #{item.id_reserva}
                        </span>
                      )}
                    </div>
                  </div>

                  {temComentario && (
                    <button
                      onClick={() => handleModerar(item.id_avaliacao)}
                      disabled={moderandoId === item.id_avaliacao}
                      className="btn btn-outline"
                      style={{
                        color: '#ef4444',
                        borderColor: '#fca5a5',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                      title="Remover o comentário"
                    >
                      <Trash2 size={15} />
                      {moderandoId === item.id_avaliacao ? 'Removendo...' : 'Remover Comentário'}
                    </button>
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.92rem',
                    color: temComentario ? 'var(--text-color)' : 'var(--text-muted)',
                    fontStyle: temComentario ? 'normal' : 'italic',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {temComentario ? item.comentario : 'Avaliação sem comentário em texto (apenas nota atribuída).'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
