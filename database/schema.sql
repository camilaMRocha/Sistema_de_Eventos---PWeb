CREATE DATABASE IF NOT EXISTS heyevents;
USE heyevents;

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('Cliente', 'Fornecedor', 'Administrador') NOT NULL,
    foto_perfil VARCHAR(255) NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE NULL,
    telefone VARCHAR(20) NOT NULL,
    rua VARCHAR(150) NULL,
    numero VARCHAR(20) NULL,
    bairro VARCHAR(100) NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(10) NULL,
    complemento VARCHAR(100) NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fornecedor (
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    nome_fornecedor VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    data_nascimento_responsavel DATE NULL,
    telefone VARCHAR(20) NOT NULL,
    categoria_atuacao VARCHAR(100) NOT NULL,
    rua VARCHAR(150) NULL,
    numero VARCHAR(20) NULL,
    bairro VARCHAR(100) NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(10) NULL,
    complemento VARCHAR(100) NULL,
    nome_banco VARCHAR(100) NULL,
    agencia VARCHAR(20) NULL,
    tipo_conta VARCHAR(50) NULL,
    titular_conta VARCHAR(150) NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS funcionario (
    id_funcionario INT AUTO_INCREMENT PRIMARY KEY,
    id_fornecedor INT NOT NULL,
    nome_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cpf_cnpj VARCHAR(18) NOT NULL UNIQUE,
    data_nascimento DATE NULL,
    telefone VARCHAR(20) NOT NULL,
    rua VARCHAR(150) NULL,
    numero VARCHAR(20) NULL,
    bairro VARCHAR(100) NULL,
    cidade VARCHAR(100) NULL,
    estado VARCHAR(2) NULL,
    cep VARCHAR(10) NULL,
    funcao_exercida VARCHAR(100) NOT NULL,
    descricao_funcao TEXT NULL,
    foto_perfil VARCHAR(255) NULL,
    nome_banco VARCHAR(100) NULL,
    agencia VARCHAR(20) NULL,
    tipo_conta VARCHAR(50) NULL,
    titular_conta VARCHAR(150) NULL,
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS administrador (
    id_administrador INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    nivel_acesso VARCHAR(50) DEFAULT 'Geral',
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS palavra_proibida (
    id_palavra INT AUTO_INCREMENT PRIMARY KEY,
    id_administrador INT NOT NULL,
    palavra VARCHAR(100) NOT NULL UNIQUE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_administrador) REFERENCES administrador(id_administrador) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria VARCHAR(100) NOT NULL,
    id_categoria_pai INT NULL,
    FOREIGN KEY (id_categoria_pai) REFERENCES categoria(id_categoria) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS local (
    id_local INT AUTO_INCREMENT PRIMARY KEY,
    id_fornecedor INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    rua VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    complemento VARCHAR(100) NULL,
    capacidade INT NOT NULL,
    preco_diaria DECIMAL(10, 2) NOT NULL,
    descricao TEXT NULL,
    quartos INT DEFAULT 0,
    banheiros INT DEFAULT 0,
    vagas_estacionamento INT DEFAULT 0,
    metragem DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS local_imagem (
    id_imagem INT AUTO_INCREMENT PRIMARY KEY,
    id_local INT NOT NULL,
    url_imagem VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 1,
    FOREIGN KEY (id_local) REFERENCES local(id_local) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS local_categoria (
    id_local INT NOT NULL,
    id_categoria INT NOT NULL,
    PRIMARY KEY (id_local, id_categoria),
    FOREIGN KEY (id_local) REFERENCES local(id_local) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS servico (
    id_servico INT AUTO_INCREMENT PRIMARY KEY,
    id_fornecedor INT NOT NULL,
    id_funcionario INT NULL,
    nome VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    descricao TEXT NULL,
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor) ON DELETE CASCADE,
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS evento (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_categoria INT NOT NULL,
    nome_evento VARCHAR(150) NOT NULL,
    formato ENUM('Presencial', 'Online') NOT NULL DEFAULT 'Presencial',
    visibilidade ENUM('Publico', 'Privado') NOT NULL DEFAULT 'Privado',
    data_hora_inicio DATETIME NOT NULL,
    data_hora_termino DATETIME NOT NULL,
    descricao_evento TEXT NULL,
    orcamento_estimado DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS evento_imagem (
    id_imagem INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    url_imagem VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 1,
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ingresso (
    id_ingresso INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    titulo_ingresso VARCHAR(100) NOT NULL,
    tipo_ingresso ENUM('Gratuito', 'Pago') NOT NULL DEFAULT 'Pago',
    preco DECIMAL(10, 2) NULL,
    quantidade_total INT NOT NULL,
    quem_pode_comprar VARCHAR(100) DEFAULT 'Qualquer pessoa',
    permite_troca_titularidade BOOLEAN DEFAULT TRUE,
    inicio_vendas_por VARCHAR(50) DEFAULT 'Data específica',
    quantidade_min_compra INT DEFAULT 1,
    quantidade_max_compra INT DEFAULT 10,
    data_hora_inicio_vendas DATETIME NOT NULL,
    data_hora_termino_vendas DATETIME NOT NULL,
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ingresso_venda (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_ingresso INT NOT NULL,
    id_cliente INT NOT NULL,
    quantidade INT NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    data_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    codigo_ingresso VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (id_ingresso) REFERENCES ingresso(id_ingresso) ON DELETE RESTRICT,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS reserva (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    id_local INT NOT NULL,
    status_reserva ENUM('Pendente', 'Confirmado', 'Concluido', 'Cancelado') NOT NULL DEFAULT 'Pendente',
    data_hora_inicio DATETIME NOT NULL,
    data_hora_fim DATETIME NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE,
    FOREIGN KEY (id_local) REFERENCES local(id_local) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS reserva_servico (
    id_reserva_servico INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    id_servico INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    valor_contratado DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva) ON DELETE CASCADE,
    FOREIGN KEY (id_servico) REFERENCES servico(id_servico) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS pagamento (
    id_pagamento INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NULL,
    id_venda_ingresso INT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_pagamento DATETIME DEFAULT CURRENT_TIMESTAMP,
    metodo_pagamento ENUM('Cartao de Credito', 'Boleto', 'Pix', 'Transferencia') NOT NULL,
    status_pagamento ENUM('Pendente', 'Aprovado', 'Recusado', 'Estornado') NOT NULL DEFAULT 'Pendente',
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva) ON DELETE SET NULL,
    FOREIGN KEY (id_venda_ingresso) REFERENCES ingresso_venda(id_venda) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS avaliacao (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_local INT NULL,
    id_servico INT NULL,
    nota INT NOT NULL,
    comentario TEXT NULL,
    data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_local) REFERENCES local(id_local) ON DELETE CASCADE,
    FOREIGN KEY (id_servico) REFERENCES servico(id_servico) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notificacao (
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    mensagem TEXT NOT NULL,
    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    visualizada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- VIEWS
CREATE OR REPLACE VIEW vw_eventos_publicos AS
SELECT id_evento, nome_evento, formato, data_hora_inicio, data_hora_termino,
       descricao_evento, id_categoria, id_cliente
FROM evento
WHERE visibilidade = 'Publico';

CREATE OR REPLACE VIEW vw_notificacoes_pendentes AS
SELECT id_notificacao, id_usuario, mensagem, data_envio
FROM notificacao
WHERE visualizada = FALSE;

CREATE OR REPLACE VIEW vw_categoria_hierarquia AS
SELECT c.id_categoria,
       c.nome_categoria AS subcategoria,
       p.id_categoria   AS id_categoria_pai,
       p.nome_categoria AS tipo_evento
FROM categoria c
LEFT JOIN categoria p ON c.id_categoria_pai = p.id_categoria;

CREATE OR REPLACE VIEW vw_funcionarios_fornecedor AS
SELECT f.id_funcionario, f.nome_completo, f.funcao_exercida, f.telefone,
       fo.id_fornecedor, fo.nome_fornecedor
FROM funcionario f
JOIN fornecedor fo ON f.id_fornecedor = fo.id_fornecedor;

CREATE OR REPLACE VIEW vw_ingressos_em_venda AS
SELECT id_ingresso, id_evento, titulo_ingresso, tipo_ingresso, preco
FROM ingresso
WHERE NOW() BETWEEN data_hora_inicio_vendas AND data_hora_termino_vendas;

CREATE OR REPLACE VIEW vw_eventos AS
SELECT e.id_evento, e.nome_evento, e.id_cliente, c.nome_categoria,
       e.formato, e.visibilidade, e.data_hora_inicio, e.data_hora_termino,
       e.orcamento_estimado
FROM evento e
JOIN categoria c ON e.id_categoria = c.id_categoria;

CREATE OR REPLACE VIEW vw_locais AS
SELECT id_local, id_fornecedor, nome,
       CONCAT(rua, ', ', numero, ' - ', cidade, '/', estado) AS endereco,
       capacidade, preco_diaria
FROM local;

CREATE OR REPLACE VIEW vw_fornecedores AS
SELECT f.id_fornecedor, f.nome_fornecedor, u.email, f.telefone,
       f.cidade, f.estado, f.categoria_atuacao
FROM fornecedor f
JOIN usuario u ON f.id_usuario = u.id_usuario;

CREATE OR REPLACE VIEW vw_servicos AS
SELECT s.id_servico, s.nome, s.categoria, s.preco,
       f.nome_fornecedor,
       fu.nome_completo AS funcionario_responsavel
FROM servico s
JOIN fornecedor f ON s.id_fornecedor = f.id_fornecedor
LEFT JOIN funcionario fu ON s.id_funcionario = fu.id_funcionario;

CREATE OR REPLACE VIEW vw_ingressos AS
SELECT i.id_ingresso, e.nome_evento, i.titulo_ingresso, i.tipo_ingresso,
       i.preco, i.quantidade_total
FROM ingresso i
JOIN evento e ON i.id_evento = e.id_evento;

CREATE OR REPLACE VIEW vw_avaliacao_media_local AS
SELECT id_local, ROUND(AVG(nota), 1) AS nota_media, COUNT(*) AS total_avaliacoes
FROM avaliacao
WHERE id_local IS NOT NULL
GROUP BY id_local;

CREATE OR REPLACE VIEW vw_avaliacao_media_servico AS
SELECT id_servico, ROUND(AVG(nota), 1) AS nota_media, COUNT(*) AS total_avaliacoes
FROM avaliacao
WHERE id_servico IS NOT NULL
GROUP BY id_servico;

CREATE OR REPLACE VIEW vw_disponibilidade_ingresso AS
SELECT i.id_ingresso, i.id_evento, i.titulo_ingresso, i.tipo_ingresso,
       i.quantidade_total,
       COALESCE(SUM(v.quantidade), 0) AS quantidade_vendida,
       i.quantidade_total - COALESCE(SUM(v.quantidade), 0) AS quantidade_disponivel,
       CASE
           WHEN i.quantidade_total - COALESCE(SUM(v.quantidade), 0) <= 0 THEN 'Esgotado'
           ELSE 'Disponivel'
       END AS status_estoque
FROM ingresso i
LEFT JOIN ingresso_venda v ON v.id_ingresso = i.id_ingresso
GROUP BY i.id_ingresso, i.id_evento, i.titulo_ingresso, i.tipo_ingresso, i.quantidade_total;

CREATE OR REPLACE VIEW vw_local_cartao AS
SELECT l.id_local, l.nome, l.descricao, l.preco_diaria, l.cidade, l.estado,
       l.quartos, l.banheiros, l.vagas_estacionamento, l.metragem,
       fo.nome_fornecedor AS proprietario,
       fo.telefone AS contato_proprietario,
       COALESCE(am.nota_media, 0) AS nota_media,
       COALESCE(am.total_avaliacoes, 0) AS total_avaliacoes,
       GROUP_CONCAT(DISTINCT cat.nome_categoria SEPARATOR ', ') AS categorias
FROM local l
JOIN fornecedor fo ON l.id_fornecedor = fo.id_fornecedor
LEFT JOIN vw_avaliacao_media_local am ON am.id_local = l.id_local
LEFT JOIN local_categoria lc ON lc.id_local = l.id_local
LEFT JOIN categoria cat ON cat.id_categoria = lc.id_categoria
GROUP BY l.id_local, l.nome, l.descricao, l.preco_diaria, l.cidade, l.estado,
         l.quartos, l.banheiros, l.vagas_estacionamento, l.metragem,
         fo.nome_fornecedor, fo.telefone, am.nota_media, am.total_avaliacoes;

CREATE OR REPLACE VIEW vw_calendario_local AS
SELECT r.id_local, r.id_reserva, r.data_hora_inicio, r.data_hora_fim, r.status_reserva
FROM reserva r
WHERE r.status_reserva IN ('Confirmado', 'Concluido');

CREATE OR REPLACE VIEW vw_busca_eventos AS
SELECT e.id_evento, e.nome_evento, e.formato,
       e.data_hora_inicio, e.data_hora_termino,
       cat.nome_categoria AS subcategoria,
       catpai.nome_categoria AS tipo_evento,
       cl.nome AS organizador,
       l.nome AS nome_local,
       l.cidade, l.estado, l.preco_diaria
FROM evento e
JOIN categoria cat ON e.id_categoria = cat.id_categoria
LEFT JOIN categoria catpai ON cat.id_categoria_pai = catpai.id_categoria
JOIN cliente cl ON e.id_cliente = cl.id_cliente
LEFT JOIN reserva r ON r.id_evento = e.id_evento AND r.status_reserva <> 'Cancelado'
LEFT JOIN local l ON r.id_local = l.id_local
WHERE e.visibilidade = 'Publico';

CREATE OR REPLACE VIEW vw_financeiro_evento AS
SELECT e.id_evento, e.nome_evento, e.orcamento_estimado,
       COALESCE(SUM(CASE WHEN p.status_pagamento = 'Aprovado' THEN p.valor ELSE 0 END), 0) AS total_recebido,
       e.orcamento_estimado - COALESCE(SUM(CASE WHEN p.status_pagamento = 'Aprovado' THEN p.valor ELSE 0 END), 0) AS saldo_pendente
FROM evento e
LEFT JOIN reserva r ON r.id_evento = e.id_evento
LEFT JOIN pagamento p ON p.id_reserva = r.id_reserva
GROUP BY e.id_evento, e.nome_evento, e.orcamento_estimado;

CREATE OR REPLACE VIEW vw_reserva_completa AS
SELECT r.id_reserva, r.status_reserva, r.data_hora_inicio, r.data_hora_fim, r.valor_total,
       ev.nome_evento, l.nome AS nome_local,
       COALESCE(SUM(rs.valor_contratado * rs.quantidade), 0) AS total_servicos_contratados,
       COALESCE(SUM(CASE WHEN pg.status_pagamento = 'Aprovado' THEN pg.valor ELSE 0 END), 0) AS total_pago
FROM reserva r
JOIN evento ev ON r.id_evento = ev.id_evento
JOIN local l ON r.id_local = l.id_local
LEFT JOIN reserva_servico rs ON rs.id_reserva = r.id_reserva
LEFT JOIN pagamento pg ON pg.id_reserva = r.id_reserva
GROUP BY r.id_reserva, r.status_reserva, r.data_hora_inicio, r.data_hora_fim, r.valor_total, ev.nome_evento, l.nome;

CREATE OR REPLACE VIEW vw_receita_fornecedor AS
SELECT 
    f.id_fornecedor,
    f.nome_fornecedor,
    COALESCE(rl.receita_locais, 0) AS receita_locais,
    COALESCE(rs.receita_servicos, 0) AS receita_servicos,
    COALESCE(rl.receita_locais, 0) + COALESCE(rs.receita_servicos, 0) AS receita_total
FROM fornecedor f
LEFT JOIN (
    SELECT l.id_fornecedor, SUM(r.valor_total) AS receita_locais
    FROM local l
    JOIN reserva r ON r.id_local = l.id_local
    WHERE r.status_reserva <> 'Cancelado'
    GROUP BY l.id_fornecedor
) rl ON rl.id_fornecedor = f.id_fornecedor
LEFT JOIN (
    SELECT s.id_fornecedor, SUM(rs.valor_contratado * rs.quantidade) AS receita_servicos
    FROM servico s
    JOIN reserva_servico rs ON rs.id_servico = s.id_servico
    GROUP BY s.id_fornecedor
) rs ON rs.id_fornecedor = f.id_fornecedor;
