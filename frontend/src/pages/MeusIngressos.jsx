import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Ticket, Calendar, MapPin, CheckCircle, AlertCircle, QrCode } from 'lucide-react';

export default function MeusIngressos() {
  const { user } = useAuth();
  const [ingressos, setIngressos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregarIngressos = async () => {
    const idCliente = user?.id_perfil || user?.id_cliente;
    if (!user || !idCliente) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/ingressos/meus-ingressos/${idCliente}`);
      setIngressos(data || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar ingressos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarIngressos();
  }, [user]);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Ticket size={28} color="var(--primary)" />
            <h1 style={{ fontSize: '1.75rem', color: 'var(--secondary)', margin: 0 }}>
              Meus Ingressos
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Ingressos adquiridos para eventos na plataforma HeyEvents.
          </p>
        </div>

        <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          Explorar Eventos
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Carregando seus ingressos...
        </div>
      ) : ingressos.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <Ticket size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
            Você ainda não possui ingressos
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            Navegue pela vitrine da plataforma e garanta sua presença nos melhores eventos!
          </p>
          <Link to="/" className="btn btn-primary">
            Ver Eventos Disponíveis
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {ingressos.map((item) => (
            <div
              key={item.id_venda}
              className="form-card"
              style={{
                padding: '0',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Ingresso Confirmado
                  </span>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, lineHeight: 1.3 }}>
                    {item.nome_evento}
                  </h3>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                  <QrCode size={28} color="white" />
                </div>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
                    <Ticket size={16} color="var(--primary)" />
                    <span>Lote: <strong>{item.titulo_ingresso}</strong></span>
                  </div>

                  {item.data_hora_inicio && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
                      <Calendar size={16} color="var(--primary)" />
                      <span>{new Date(item.data_hora_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  )}

                  {item.local_nome && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
                      <MapPin size={16} color="var(--primary)" />
                      <span>{item.local_nome}</span>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    borderTop: '2px dashed #e2e8f0',
                    paddingTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Código do Ingresso
                    </span>
                    <strong style={{ fontSize: '1.1rem', letterSpacing: '0.08em', color: 'var(--secondary)' }}>
                      {item.codigo_ingresso}
                    </strong>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {item.quantidade} {item.quantidade === 1 ? 'unidade' : 'unidades'}
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: item.valor_total > 0 ? '#16a34a' : 'var(--primary)' }}>
                      {item.valor_total > 0 ? `R$ ${item.valor_total.toFixed(2)}` : 'Gratuito'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
