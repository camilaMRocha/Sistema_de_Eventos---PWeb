import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/login', { email, senha });
      login(data);

      if (data.tipo_usuario === 'Fornecedor') {
        navigate('/meus-locais');
      } else {
        navigate('/meus-eventos');
      }
    } catch (err) {
      setError(err.message || 'Falha ao autenticar. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
      <div className="form-card" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--secondary)', marginBottom: '0.4rem' }}>
            Acessar Plataforma
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Entre com suas credenciais para gerenciar seus eventos ou locais.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail do usuário</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="exemplo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <Link
              to="/cadastro"
              style={{ color: '#0284c7', textDecoration: 'underline', fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}
            >
              Ainda não possui uma conta? Cadastre-se
            </Link>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Funcionalidade de recuperação de senha em desenvolvimento.');
              }}
              style={{ color: '#64748b', textDecoration: 'underline', fontSize: '0.82rem', fontStyle: 'italic' }}
            >
              Esqueceu a senha? Clique aqui
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            <LogIn size={18} />
            {loading ? 'Entrando...' : 'Logar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textDecoration: 'none' }}>
            Voltar à página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}