# MODELO DE DADOS — VERSÃO ATUALIZADA (com base no protótipo)

## 0. RESUMO DAS ALTERAÇÕES EM RELAÇÃO À VERSÃO ANTERIOR

**Entidades novas:**
- `Administrador` — terceiro papel de usuário, visto na sua explicação ("o administrador consegue ver informações gerais do site").
- `Funcionario` — cadastro de profissionais vinculados a um Fornecedor (tela "Cadastro de profissionais"), cada um com função exercida (Decoradora, Buffet, etc.).
- `Categoria` — entidade hierárquica (tipo de evento → subcategoria) usada tanto pelo Evento quanto pelo Local. Antes "tipo_evento" e "categoria" eram texto livre; no protótipo são dois combos dependentes (Social → Casamento/Aniversário/Bodas/...).
- `Local_Categoria` — associativa N:N, porque um Local pode ter várias tags (o card do local mostra 5 categorias ao mesmo tempo: Social, Casamento, Aniversário, Bodas, Culturais).
- `Local_Imagem` e `Evento_Imagem` — galerias de fotos (o cadastro de evento tem "limite de 10 fotos"; cadastro de local tem "Adicionar fotos do local").
- `Ingresso` — nova entidade pedida por você, para a seção "Informações do ingresso" (gratuito/pago, quantidade, regras de venda, período de vendas).
- `Ingresso_Venda` — registro de cada compra de ingresso por um cliente (necessário para não confundir "tipo de ingresso configurado pelo organizador" com "ingresso comprado por alguém").

**Entidades alteradas:**
- `Usuario`: ganhou `foto_perfil`.
- `Cliente`: ganhou `data_nascimento` e endereço decomposto (rua, número, bairro, cidade, estado, CEP, complemento) em vez de um campo único.
- `Fornecedor`: ganhou endereço decomposto, `data_nascimento` do responsável e dados bancários (nome_banco, agência, tipo_conta, titular_conta) — vistos nas telas de cadastro de local/profissional, que na prática são cadastros de Fornecedor (quem recebe pagamento).
- `Local`: ganhou `id_fornecedor` (todo local pertence a um fornecedor/proprietário), endereço decomposto, `quartos`, `banheiros`, `vagas_estacionamento`, `metragem`.
- `Servico`: ganhou `id_funcionario` (opcional), porque um serviço pode ser prestado por um profissional específico da empresa.
- `Evento`: `data_evento` virou `data_hora_inicio` + `data_hora_termino`; ganhou `id_categoria`, `formato` (Presencial/Online), `visibilidade` (Público/Privado) e `descricao_evento`.
- `Reserva`: `data_reserva` virou `data_hora_inicio` + `data_hora_fim` (o calendário do local mostra períodos ocupados, não uma data única).
- `Pagamento`: agora pode se referir a uma `Reserva` OU a uma `Ingresso_Venda` (nunca as duas), seguindo o mesmo padrão de exclusividade que você já usa em `Avaliacao` (RN09).

---

## 1. LEVANTAMENTO DAS ENTIDADES

1. Usuario
2. Cliente
3. Fornecedor
4. Funcionario **(novo)**
5. Administrador **(novo)**
6. Categoria **(novo)**
7. Local
8. Local_Imagem **(novo)**
9. Local_Categoria **(novo, associativa)**
10. Servico
11. Evento
12. Evento_Imagem **(novo)**
13. Ingresso **(novo)**
14. Ingresso_Venda **(novo)**
15. Reserva
16. Reserva_Servico (associativa)
17. Pagamento
18. Avaliacao
19. Notificacao

---

## 2. LEVANTAMENTO DOS ATRIBUTOS

* **Usuario**: id_usuario, email, senha, tipo_usuario, foto_perfil, data_cadastro
* **Cliente**: id_cliente, id_usuario, nome, cpf, data_nascimento, telefone, rua, numero, bairro, cidade, estado, cep, complemento
* **Fornecedor**: id_fornecedor, id_usuario, nome_fornecedor, cnpj, data_nascimento_responsavel, telefone, categoria_atuacao, rua, numero, bairro, cidade, estado, cep, complemento, nome_banco, agencia, tipo_conta, titular_conta
* **Funcionario**: id_funcionario, id_fornecedor, nome_completo, email, cpf_cnpj, data_nascimento, telefone, rua, numero, bairro, cidade, estado, cep, funcao_exercida, descricao_funcao, foto_perfil, nome_banco, agencia, tipo_conta, titular_conta
* **Administrador**: id_administrador, id_usuario, nome, nivel_acesso
* **Categoria**: id_categoria, nome_categoria, id_categoria_pai
* **Local**: id_local, id_fornecedor, nome, rua, numero, bairro, cidade, estado, cep, complemento, capacidade, preco_diaria, descricao, quartos, banheiros, vagas_estacionamento, metragem
* **Local_Imagem**: id_imagem, id_local, url_imagem, ordem
* **Local_Categoria**: id_local, id_categoria
* **Servico**: id_servico, id_fornecedor, id_funcionario, nome, categoria, preco, descricao
* **Evento**: id_evento, id_cliente, id_categoria, nome_evento, formato, visibilidade, data_hora_inicio, data_hora_termino, descricao_evento, orcamento_estimado
* **Evento_Imagem**: id_imagem, id_evento, url_imagem, ordem
* **Ingresso**: id_ingresso, id_evento, titulo_ingresso, tipo_ingresso, preco, quantidade_total, quem_pode_comprar, permite_troca_titularidade, inicio_vendas_por, quantidade_min_compra, quantidade_max_compra, data_hora_inicio_vendas, data_hora_termino_vendas
* **Ingresso_Venda**: id_venda, id_ingresso, id_cliente, quantidade, valor_total, data_compra, codigo_ingresso
* **Reserva**: id_reserva, id_evento, id_local, status_reserva, data_hora_inicio, data_hora_fim, valor_total
* **Reserva_Servico**: id_reserva_servico, id_reserva, id_servico, quantidade, valor_contratado
* **Pagamento**: id_pagamento, id_reserva, id_venda_ingresso, valor, data_pagamento, metodo_pagamento, status_pagamento
* **Avaliacao**: id_avaliacao, id_cliente, id_local, id_servico, nota, comentario, data_avaliacao
* **Notificacao**: id_notificacao, id_usuario, mensagem, data_envio, visualizada

---

## 3. DEFINIÇÃO DAS CHAVES

* **Usuario** — id_usuario (PK)
* **Cliente** — id_cliente (PK) · id_usuario (FK → Usuario)
* **Fornecedor** — id_fornecedor (PK) · id_usuario (FK → Usuario)
* **Funcionario** — id_funcionario (PK) · id_fornecedor (FK → Fornecedor)
* **Administrador** — id_administrador (PK) · id_usuario (FK → Usuario)
* **Categoria** — id_categoria (PK) · id_categoria_pai (FK → Categoria, autorrelacionamento, nulo para categorias-raiz)
* **Local** — id_local (PK) · id_fornecedor (FK → Fornecedor)
* **Local_Imagem** — id_imagem (PK) · id_local (FK → Local)
* **Local_Categoria** — id_local + id_categoria (PK composta) · id_local (FK → Local) · id_categoria (FK → Categoria)
* **Servico** — id_servico (PK) · id_fornecedor (FK → Fornecedor) · id_funcionario (FK → Funcionario, opcional)
* **Evento** — id_evento (PK) · id_cliente (FK → Cliente) · id_categoria (FK → Categoria)
* **Evento_Imagem** — id_imagem (PK) · id_evento (FK → Evento)
* **Ingresso** — id_ingresso (PK) · id_evento (FK → Evento)
* **Ingresso_Venda** — id_venda (PK) · id_ingresso (FK → Ingresso) · id_cliente (FK → Cliente)
* **Reserva** — id_reserva (PK) · id_evento (FK → Evento) · id_local (FK → Local)
* **Pagamento** — id_pagamento (PK) · id_reserva (FK → Reserva, opcional) · id_venda_ingresso (FK → Ingresso_Venda, opcional)
* **Avaliacao** — id_avaliacao (PK) · id_cliente (FK → Cliente) · id_local (FK → Local) · id_servico (FK → Servico)
* **Notificacao** — id_notificacao (PK) · id_usuario (FK → Usuario)
* **Reserva_Servico** — id_reserva_servico (PK) · id_reserva (FK → Reserva) · id_servico (FK → Servico)

---

## 3.1. RESTRIÇÕES DE INTEGRIDADE (UNIQUE E CHECK)

* **Usuario** — UNIQUE (email)
* **Cliente** — UNIQUE (cpf)
* **Fornecedor** — UNIQUE (cnpj)
* **Funcionario** — UNIQUE (email); UNIQUE (cpf_cnpj)
* **Categoria** — CHECK (id_categoria_pai <> id_categoria) — impede uma categoria ser pai dela mesma
* **Local** — CHECK (capacidade > 0) · CHECK (preco_diaria >= 0) · CHECK (quartos >= 0) · CHECK (banheiros >= 0) · CHECK (vagas_estacionamento >= 0) · CHECK (metragem > 0)
* **Local_Imagem** — CHECK (ordem >= 1); no máximo 10 registros por id_local, controlado em aplicação (RN14)
* **Servico** — CHECK (preco >= 0)
* **Evento** — CHECK (orcamento_estimado >= 0) · CHECK (data_hora_termino > data_hora_inicio)
* **Evento_Imagem** — no máximo 10 registros por id_evento, controlado em aplicação
* **Ingresso** — CHECK (quantidade_total > 0) · CHECK (quantidade_min_compra > 0) · CHECK (quantidade_max_compra >= quantidade_min_compra) · CHECK (data_hora_termino_vendas > data_hora_inicio_vendas) · CHECK (preco IS NULL quando tipo_ingresso = 'Gratuito' e preco > 0 quando tipo_ingresso = 'Pago')
* **Ingresso_Venda** — CHECK (quantidade > 0) · CHECK (valor_total >= 0)
* **Reserva** — CHECK (valor_total >= 0) · CHECK (data_hora_fim > data_hora_inicio)
* **Pagamento** — CHECK (valor > 0) · CHECK ((id_reserva IS NOT NULL AND id_venda_ingresso IS NULL) OR (id_reserva IS NULL AND id_venda_ingresso IS NOT NULL)) — exclusividade, mesmo padrão da RN09
* **Avaliacao** — CHECK (nota >= 1 AND nota <= 5)
* **Reserva_Servico** — CHECK (quantidade > 0) · CHECK (valor_contratado >= 0)

---

## 4. RELACIONAMENTOS

* Usuario possui Cliente
* Usuario possui Fornecedor
* Usuario possui Administrador
* Fornecedor possui Funcionario
* Fornecedor é dono de Local
* Fornecedor oferece Servico
* Funcionario executa Servico (opcional)
* Categoria classifica Evento
* Local possui Categoria (via Local_Categoria)
* Categoria é subcategoria de Categoria (autorrelacionamento)
* Cliente cria Evento
* Evento possui Imagem (Evento_Imagem)
* Local possui Imagem (Local_Imagem)
* Evento possui Ingresso
* Cliente compra Ingresso (via Ingresso_Venda)
* Evento possui Reserva
* Reserva gera Pagamento
* Ingresso_Venda gera Pagamento
* Cliente realiza Avaliacao
* Local recebe Avaliacao
* Servico recebe Avaliacao
* Usuario recebe Notificacao
* Reserva contrata Servico (via Reserva_Servico)

---

## 5. CARDINALIDADE

* **Usuario e Cliente — 1:1**
* **Usuario e Fornecedor — 1:1**
* **Usuario e Administrador — 1:1**
  Uma conta de usuário do tipo administrador pertence a apenas um administrador, e vice-versa.
* **Fornecedor e Funcionario — 1:N**
  Uma empresa (fornecedor) pode cadastrar vários profissionais em seu quadro (decoradores, buffet, fotógrafos), mas cada profissional pertence a apenas uma empresa.
* **Fornecedor e Local — 1:N**
  Um fornecedor pode cadastrar e administrar mais de um espaço para locação, mas cada local pertence a exatamente um fornecedor proprietário.
* **Fornecedor e Servico — 1:N** *(mantido)*
* **Funcionario e Servico — 1:N (opcional)**
  Um funcionário pode estar responsável por vários serviços cadastrados por sua empresa, mas um serviço tem no máximo um funcionário responsável — pode também não ter nenhum, caso seja atendido pela empresa como um todo.
* **Categoria e Categoria — 1:N (autorrelacionamento)**
  Uma categoria "pai" (ex: Social) pode ter várias subcategorias (Casamento, Aniversário, Bodas, Chá de bebê, Formatura), mas cada subcategoria pertence a apenas uma categoria pai. Categorias-raiz não têm pai.
* **Categoria e Evento — 1:N**
  Uma subcategoria pode classificar vários eventos, mas cada evento pertence a exatamente uma subcategoria.
* **Local e Categoria — N:N (resolvida por Local_Categoria)**
  Um local pode se enquadrar em várias categorias de evento ao mesmo tempo (ex: aceita casamentos, aniversários e eventos culturais), e uma categoria agrupa vários locais diferentes.
* **Cliente e Evento — 1:N** *(mantido)*
* **Evento e Evento_Imagem — 1:N**
  Um evento pode ter até 10 fotos cadastradas, cada foto pertence a um único evento.
* **Local e Local_Imagem — 1:N**
  Um local pode ter várias fotos cadastradas, cada foto pertence a um único local.
* **Evento e Ingresso — 1:N**
  Um evento pode ter vários tipos de ingresso configurados (ex: "Portão marrom" gratuito e um lote pago), mas cada ingresso pertence a apenas um evento.
* **Ingresso e Ingresso_Venda — 1:N**
  Um tipo de ingresso pode ser vendido várias vezes (a diferentes compradores, respeitando o limite de quantidade), mas cada venda se refere a um único tipo de ingresso.
* **Cliente e Ingresso_Venda — 1:N**
  Um cliente pode comprar ingressos para vários eventos diferentes, mas cada registro de compra pertence a um único cliente comprador.
* **Evento e Reserva — 1:N** *(mantido)*
* **Reserva e Pagamento — 1:N** *(mantido)*
* **Ingresso_Venda e Pagamento — 1:N**
  Uma compra de ingresso pode ser paga em mais de uma transação (ex: estorno parcial + novo pagamento), mas cada pagamento individual está ligado a apenas uma compra.
* **Cliente e Avaliacao — 1:N** *(mantido)*
* **Local e Avaliacao — 1:N** *(mantido)*
* **Servico e Avaliacao — 1:N** *(mantido)*
* **Usuario e Notificacao — 1:N** *(mantido)*
* **Reserva e Servico — N:N** *(mantido, via Reserva_Servico)*

---

## 6. REGRAS DE NEGÓCIO (atualizadas)

* RN01 a RN09 — **mantidas como no documento original.**
* **RN10 — Limite de Estoque de Ingresso**: a soma das quantidades de todas as Ingresso_Venda de um mesmo Ingresso não pode ultrapassar o `quantidade_total` definido para aquele tipo de ingresso.
* **RN11 — Janela de Vendas**: um Ingresso só pode ser vendido (gerar Ingresso_Venda) se a data/hora da compra estiver entre `data_hora_inicio_vendas` e `data_hora_termino_vendas`.
* **RN12 — Limite por Compra**: a `quantidade` de uma Ingresso_Venda deve respeitar o intervalo `quantidade_min_compra` e `quantidade_max_compra` definido no Ingresso correspondente.
* **RN13 — Vínculo do Local**: todo Local só pode ser cadastrado por um usuário do tipo Fornecedor (o "proprietário" do protótipo é, na prática, um Fornecedor com dados bancários próprios para receber os pagamentos das reservas).
* **RN14 — Limite de Imagens**: um Evento não pode ter mais que 10 registros em Evento_Imagem (regra vista no próprio formulário: "Imagens do evento — limite de 10 fotos").
* **RN15 — Exclusividade do Pagamento**: assim como a Avaliacao (RN09), todo Pagamento deve referenciar exatamente uma origem — ou uma Reserva (id_reserva preenchido e id_venda_ingresso nulo), ou uma Ingresso_Venda (id_venda_ingresso preenchido e id_reserva nulo) — nunca as duas, nem nenhuma.
* **RN16 — Categoria Hierárquica**: uma Categoria com `id_categoria_pai` nulo é considerada "tipo de evento" (nível 1, ex: Social, Corporativo, Religioso); uma Categoria com `id_categoria_pai` preenchido é uma "subcategoria" (nível 2, ex: Casamento, Aniversário). O Evento sempre referencia uma subcategoria (nível 2), nunca um tipo de nível 1 diretamente.
* **RN17 — Escopo do Funcionário**: um Funcionario só pode ser vinculado como responsável (`id_funcionario`) a um Servico se ambos pertencerem ao mesmo Fornecedor.
* **RN18 — Acesso do Administrador**: contas do tipo Administrador não realizam reservas, avaliações ou compras de ingresso — seu acesso é restrito a leitura/gestão de dados gerais da plataforma (usuários, fornecedores, denúncias, relatórios).

---

## 7. OBSERVAÇÕES DE MODELAGEM

* O card de local no protótipo exibe um selo de nota (ex: "4+"), mas essa nota é **calculada** (média de `Avaliacao.nota` filtrada por `id_local`), não um atributo armazenado — evita redundância e mantém a 3FN.
* O botão "Contato do proprietário" no card do Local **não** precisa de um atributo próprio em `Local`: ele é resolvido via `Local.id_fornecedor → Fornecedor.telefone / Usuario.email`.
* A tela "Já tenho um local / Ainda será definido" no cadastro de evento indica que `Reserva` continua opcional na criação do Evento: se o local ainda não foi definido, nenhuma linha de `Reserva` é criada até o cliente escolher um local depois.
* A seção "Contratar serviços da plataforma / Já possuo/Não quero contratar" no cadastro de evento é apenas uma tela de **busca** sobre `Fornecedor`/`Servico` já existentes (filtrando por função, ex: Buffet); não gera entidade nova.

---

## 8. VALIDAÇÃO DA MODELAGEM (REVISÃO DAS 3 FN)

* **Todas as entidades possuem chave primária?**
  SIM. As 19 entidades possuem PK própria (de coluna única, exceto `Local_Categoria`, que é associativa pura com PK composta).

* **Todos os relacionamentos estão corretos?**
  SIM. `Local_Categoria` resolve a N:N entre Local e Categoria; `Reserva_Servico` continua resolvendo a N:N entre Reserva e Servico; `Ingresso_Venda` separa "configuração do ingresso" (feita pelo organizador) de "compra do ingresso" (feita pelo cliente), evitando misturar dois conceitos na mesma tabela.

* **As cardinalidades representam corretamente as regras de negócio?**
  SIM. O autorrelacionamento em `Categoria` reflete a hierarquia tipo→subcategoria vista nos dois combos dependentes do formulário. A exclusividade de `Pagamento` (RN15) segue o mesmo padrão já validado em `Avaliacao` (RN09).

* **Não existem entidades duplicadas?**
  SIM. `Funcionario` foi mantido separado de `Fornecedor` porque representa uma pessoa física vinculada à empresa (com CPF/CNPJ, função e dados bancários próprios), não a empresa em si.

* **Não existem atributos redundantes?**
  Continuam existindo os dois campos calculados já documentados (`Evento.orcamento_estimado` e `Reserva.valor_total`), por decisão de projeto (RN03). Nenhum atributo novo introduz redundância — a nota do local, por exemplo, foi deixada de fora da modelagem por ser derivável.

* **Revisão das Formas Normais:**
  - **1FN**: OK. O endereço, que antes era um único campo `endereco`, foi decomposto em `rua, numero, bairro, cidade, estado, cep, complemento` em `Cliente`, `Fornecedor`, `Funcionario` e `Local` — eliminando um valor composto que existia na versão anterior.
  - **2FN**: OK. Todas as PKs simples continuam de coluna única; a única PK composta é a associativa `Local_Categoria`, cujos atributos (nenhum além das chaves) não geram dependência parcial.
  - **3FN**: OK, com a mesma ressalva já documentada para os campos calculados de RN03. Nenhuma dependência transitiva nova foi introduzida pelas entidades adicionadas.
