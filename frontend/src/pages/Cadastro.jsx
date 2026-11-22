import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export default function Cadastro() {
  const [tipoPerfil, setTipoPerfil] = useState('Cliente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [complemento, setComplemento] = useState('');

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  const [nomeFornecedor, setNomeFornecedor] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [categoriaAtuacao, setCategoriaAtuacao] = useState('Locação de Espaços');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (senha !== confirmaSenha) {
      setError('A confirmação da senha não coincide com a senha digitada.');
      return;
    }

    setLoading(true);

    try {
      if (tipoPerfil === 'Cliente') {
        const payload = {
          email,
          senha,
          nome,
          cpf,
          telefone,
          cidade,
          estado,
          data_nascimento: dataNascimento || null,
          rua: rua || null,
          numero: numero || null,
          bairro: bairro || null,
          cep: cep || null,
          complemento: complemento || null,
        };
        await api.post('/clientes', payload);
      } else {
        const payload = {
          email,
          senha,
          nome_fornecedor: nomeFornecedor,
          cnpj,
          telefone,
          categoria_atuacao: categoriaAtuacao,
          cidade,
          estado,
          data_nascimento_responsavel: null,
          rua: rua || null,
          numero: numero || null,
          bairro: bairro || null,
          cep: cep || null,
          complemento: complemento || null,
          nome_banco: null,
          agencia: null,
          tipo_conta: null,
          titular_conta: null,
        };
        await api.post('/fornecedores', payload);
      }

      setSuccess('Cadastro realizado com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div className="form-card">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--secondary)' }}>Criar Nova Conta</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Selecione seu perfil e preencha seus dados para começar.
          </p>
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

        <div style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ marginBottom: '0.6rem' }}>
            Tipo de perfil na plataforma:
          </label>
          <div className="flex gap-4">
            <label
              style={{
                flex: 1,
                border: `2px solid ${tipoPerfil === 'Cliente' ? 'var(--primary)' : 'var(--border)'}`,
                backgroundColor: tipoPerfil === 'Cliente' ? '#f0fdfa' : '#ffffff',
                padding: '0.9rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <input
                type="radio"
                name="tipoPerfil"
                value="Cliente"
                checked={tipoPerfil === 'Cliente'}
                onChange={() => setTipoPerfil('Cliente')}
              />
              <div>
                <strong style={{ display: 'block', color: 'var(--secondary)' }}>
                  Organizador (Cliente)
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Desejo planejar e criar eventos
                </span>
              </div>
            </label>

            <label
              style={{
                flex: 1,
                border: `2px solid ${tipoPerfil === 'Fornecedor' ? 'var(--primary)' : 'var(--border)'}`,
                backgroundColor: tipoPerfil === 'Fornecedor' ? '#f0fdfa' : '#ffffff',
                padding: '0.9rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <input
                type="radio"
                name="tipoPerfil"
                value="Fornecedor"
                checked={tipoPerfil === 'Fornecedor'}
                onChange={() => setTipoPerfil('Fornecedor')}
              />
              <div>
                <strong style={{ display: 'block', color: 'var(--secondary)' }}>
                  Proprietário (Fornecedor)
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Desejo cadastrar e alugar espaços
                </span>
              </div>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
            1. Dados de Acesso
          </h4>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">E-mail *</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefone / WhatsApp *</label>
              <input
                type="tel"
                required
                className="form-control"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Senha *</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Senha *</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="Repita a senha"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
              />
            </div>
          </div>

          <h4 style={{ color: 'var(--secondary)', margin: '1.5rem 0 1rem 0', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
            2. {tipoPerfil === 'Cliente' ? 'Informações Pessoais' : 'Informações da Empresa / Proprietário'}
          </h4>

          {tipoPerfil === 'Cliente' ? (
            <>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">CPF *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Nascimento</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Razão Social / Nome Fantasia *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Nome da empresa ou do espaço"
                    value={nomeFornecedor}
                    onChange={(e) => setNomeFornecedor(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">CNPJ *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="00.000.000/0001-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoria de Atuação *</label>
                  <select
                    className="form-select"
                    value={categoriaAtuacao}
                    onChange={(e) => setCategoriaAtuacao(e.target.value)}
                  >
                    <option value="Locação de Espaços">Locação de Espaços</option>
                    <option value="Buffet e Gastronomia">Buffet e Gastronomia</option>
                    <option value="Decoração e Cenografia">Decoração e Cenografia</option>
                    <option value="Som e Iluminação">Som e Iluminação</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <h4 style={{ color: 'var(--secondary)', margin: '1.5rem 0 1rem 0', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
            3. Endereço e Localização
          </h4>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Cidade *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Ex: Campinas"
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
              <label className="form-label">Logradouro / Rua</label>
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
                placeholder="123"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bairro</label>
              <input
                type="text"
                className="form-control"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Complemento</label>
              <input
                type="text"
                className="form-control"
                placeholder="Apto, Bloco, etc."
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '1.5rem', fontSize: '1rem' }}
          >
            <UserPlus size={18} />
            {loading ? 'Cadastrando...' : 'Concluir Cadastro'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Já possui uma conta?{' '}
          </span>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Faça login aqui
          </Link>
        </div>
      </div>
    </div>
  );
}
