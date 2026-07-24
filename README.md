# Sistema de Eventos - _**HeyEvents**_ 

## Documentação do Projeto – Plataforma de Organização de Eventos (HeyEvents)

Esta documentação apresenta uma visão geral da modelagem orientada a objetos do sistema **HeyEvents**, descrevendo seus objetivos, as principais classes desenvolvidas, os relacionamentos existentes e a aplicação dos principais conceitos da Programação Orientada a Objetos (POO): **Classes e Objetos**, **Encapsulamento**, **Herança** e **Polimorfismo**.

---

# Objetivo do Projeto

O **HeyEvents** é uma plataforma web desenvolvida para facilitar a organização de eventos como casamentos, aniversários, festas, formaturas e eventos corporativos.

Seu principal objetivo é centralizar todo o processo de planejamento em um único ambiente, permitindo que clientes encontrem locais para eventos, contratem fornecedores de serviços, acompanhem reservas, efetuem pagamentos, adquiram ingressos e monitorem todas as etapas da organização.

Além disso, o sistema oferece uma área administrativa para gerenciamento da plataforma e uma área exclusiva para fornecedores, possibilitando o cadastro de locais, serviços e funcionários responsáveis pelos atendimentos.

## Tecnologias utilizadas

- Python
- FastAPI
- MySQL
- HTML
- CSS

## Principais usuários do sistema

- Cliente
- Fornecedor
- Administrador

---

# Explicação das Principais Classes

## Usuario

A classe **Usuario** é a superclasse responsável pelas informações comuns de qualquer pessoa que utiliza a plataforma.

Ela concentra atributos como:

- id_usuario
- email
- senha
- data_cadastro

Também possui métodos responsáveis pela autenticação do sistema, como login e alteração de senha.

Seu objetivo é evitar duplicação de código, permitindo que outras classes reutilizem essas informações.

---

## Cliente

A classe **Cliente** representa o usuário responsável pela organização dos eventos.

Além das informações herdadas de **Usuario**, possui atributos próprios, como:

- nome;
- CPF;
- telefone.

Entre suas principais responsabilidades estão:

- criar eventos;
- solicitar reservas;
- realizar avaliações;
- comprar ingressos.

Cada cliente possui exatamente uma conta de usuário.

---

## Fornecedor

Representa as empresas parceiras da plataforma.

Cada fornecedor pode:

- cadastrar locais;
- cadastrar serviços;
- cadastrar funcionários responsáveis pelos serviços.

Possui atributos específicos como:

- CNPJ;
- telefone;
- categoria.

Também herda todas as características da classe **Usuario**.

---

## Administrador

Representa os administradores da plataforma.

Sua função é realizar o gerenciamento geral do sistema, sendo responsável por:

- administração dos usuários;
- gerenciamento de fornecedores;
- consulta de relatórios;
- acompanhamento de denúncias;
- manutenção da plataforma.

Os administradores não realizam reservas, avaliações ou compras de ingressos.

---

## Evento

Representa o evento criado pelo cliente.

Armazena informações como:

- nome;
- categoria;
- data;
- orçamento;
- cliente responsável.

Também controla todos os itens adicionados ao planejamento, realizando automaticamente o cálculo do orçamento total.

---

## Local

Representa os espaços disponíveis para locação.

Cada local pertence a um fornecedor e possui informações como:

- endereço;
- capacidade;
- valor da diária;
- imagens;
- categorias atendidas.

Também controla sua disponibilidade para evitar reservas duplicadas.

---

## Serviço

Representa os serviços oferecidos pelos fornecedores, como:

- buffet;
- decoração;
- fotografia;
- sonorização;
- iluminação.

Cada serviço pertence a apenas um fornecedor e pode possuir um funcionário responsável.

Assim como os locais, controla sua disponibilidade para impedir conflitos de agenda.

---

## Reserva

Representa a contratação realizada para um evento.

Controla:

- status da reserva;
- local contratado;
- serviços contratados;
- valor total.

Seu status somente pode ser alterado pelos métodos específicos do sistema, garantindo o cumprimento das regras de negócio.

---

## Pagamento

Responsável por registrar todas as transações financeiras do sistema.

Antes de confirmar um pagamento, realiza validações para garantir que o valor pago não ultrapasse o valor acordado da reserva ou da compra de ingressos.

---

## Avaliacao

Permite que clientes avaliem locais ou serviços após a realização do evento.

Também garante que:

- a nota esteja entre 1 e 5;
- a avaliação seja destinada apenas a um local ou a um serviço.

---

## Oferta

É uma classe abstrata criada para representar tudo aquilo que pode ser contratado em um evento.

Ela serve como base para:

- Local;
- Servico.

Essa estrutura permite tratar ambos de maneira genérica durante o planejamento do evento.

---

# Justificativa dos Relacionamentos entre as Classes

## Usuario — Cliente (1:1)

Cada cliente possui apenas uma conta para acessar o sistema, e cada conta está vinculada a um único cliente.

## Usuario — Fornecedor (1:1)

Cada fornecedor possui uma única conta de acesso para administrar seus serviços e locais.

## Usuario — Administrador (1:1)

Cada administrador possui apenas uma conta administrativa.

## Fornecedor — Funcionario (1:N)

Um fornecedor pode cadastrar diversos funcionários responsáveis pelos serviços oferecidos.

Cada funcionário pertence exclusivamente à empresa que o cadastrou.

## Fornecedor — Local (1:N)

Uma empresa pode administrar vários espaços para eventos.

Cada local pertence a apenas um fornecedor.

## Fornecedor — Servico (1:N)

Um fornecedor pode oferecer diversos serviços.

Cada serviço pertence exclusivamente a um fornecedor.

## Funcionario — Servico (1:N)

Um funcionário pode ser responsável por diversos serviços.

Cada serviço possui apenas um responsável.

## Categoria — Categoria (1:N)

Foi utilizado um relacionamento recursivo para organizar categorias em níveis hierárquicos.

Exemplo:

- Social
  - Casamento
  - Aniversário
  - Formatura

## Categoria — Evento (1:N)

Uma categoria pode classificar diversos eventos.

Cada evento pertence a apenas uma subcategoria.

## Local — Categoria (N:N)

Um local pode atender vários tipos de eventos.

Da mesma forma, uma categoria pode agrupar diversos locais.

## Cliente — Evento (1:N)

Um cliente pode organizar vários eventos ao longo do tempo.

Cada evento pertence apenas ao cliente que o criou.

## Evento — Evento_Imagem (1:N)

Permite armazenar várias imagens para um mesmo evento.

## Local — Local_Imagem (1:N)

Permite cadastrar diversas fotografias de um espaço.

## Evento — Ingresso (1:N)

Um evento pode possuir vários tipos de ingressos.

## Ingresso — Ingresso_Venda (1:N)

Um mesmo tipo de ingresso pode ser vendido diversas vezes.

## Cliente — Ingresso_Venda (1:N)

Um cliente pode comprar ingressos para diferentes eventos.

## Evento — Reserva (1:N)

Cada evento pode possuir várias reservas relacionadas aos serviços e locais contratados.

## Reserva — Pagamento (1:N)

Permite pagamentos parcelados para uma mesma reserva.

## Ingresso_Venda — Pagamento (1:N)

Permite registrar pagamentos relacionados à compra de ingressos.

## Cliente — Avaliacao (1:N)

Um cliente pode realizar diversas avaliações.

## Local — Avaliacao (1:N)

Um local pode receber diversas avaliações.

## Servico — Avaliacao (1:N)

Um serviço pode receber diversas avaliações.

## Usuario — Notificacao (1:N)

Cada usuário pode receber várias notificações do sistema.

## Reserva — Servico (N:N)

Uma reserva pode contratar vários serviços.

Da mesma forma, um serviço pode participar de diversas reservas.

Esse relacionamento é implementado pela entidade associativa **ReservaServico**, responsável por armazenar informações como quantidade contratada e valor negociado.

---

# Aplicação dos Conceitos de Programação Orientada a Objetos

## Classes e Objetos

Durante o desenvolvimento do sistema, cada elemento do domínio foi representado por uma classe.

Exemplos:

- Usuario;
- Cliente;
- Fornecedor;
- Evento;
- Reserva;
- Local;
- Servico;
- Pagamento.

Essas classes definem atributos e comportamentos que servirão como modelo para a criação dos objetos.

Os objetos representam instâncias dessas classes.

Exemplos:

- um cliente chamado João;
- um fornecedor chamado Buffet Sabor Real;
- um evento chamado Casamento João e Maria;
- uma reserva realizada para determinado evento.

Cada objeto possui seus próprios dados, mas compartilha a estrutura definida por sua classe.

---

## Encapsulamento

O encapsulamento foi utilizado para proteger informações sensíveis do sistema e garantir que elas sejam modificadas apenas por métodos específicos.

Os principais exemplos são:

- senha do usuário privada;
- CPF e CNPJ somente leitura após o cadastro;
- orçamento do evento calculado automaticamente;
- status da reserva alterado apenas pelos métodos de confirmação e cancelamento;
- valor do pagamento validado antes de ser registrado;
- nota da avaliação aceita apenas entre 1 e 5.

Essa abordagem garante maior segurança, consistência e integridade dos dados.

---

## Herança

A herança foi utilizada para reaproveitar características comuns entre diferentes tipos de usuários.

A classe **Usuario** atua como superclasse, enquanto:

- Cliente;
- Fornecedor;
- Administrador.

são especializações dessa classe.

Todos compartilham funcionalidades como login, e-mail, senha e data de cadastro, mas cada classe adiciona seus próprios atributos e comportamentos específicos.

Essa estratégia reduz duplicação de código e facilita a manutenção do sistema.

---

## Polimorfismo

O polimorfismo foi aplicado por meio da classe abstrata **Oferta**.

As classes **Local** e **Servico** herdam dessa superclasse e implementam os mesmos métodos de maneiras diferentes.

Os principais métodos sobrescritos são:

- `verificar_disponibilidade(data)`
- `calcular_valor()`

Assim, durante o planejamento de um evento, o sistema consegue tratar qualquer item contratado como uma **Oferta**, independentemente de ser um local ou um serviço.

Cada objeto executa automaticamente sua própria implementação dos métodos, tornando o código mais flexível, reutilizável e preparado para futuras expansões.

---

# Conclusão

A modelagem orientada a objetos do **HeyEvents** foi desenvolvida para representar de forma fiel o processo de organização de eventos, aplicando os principais conceitos da Programação Orientada a Objetos.

A utilização de classes especializadas, relacionamentos consistentes com as regras de negócio, encapsulamento para proteção dos dados, herança para reutilização de código e polimorfismo para flexibilizar o tratamento das ofertas torna a arquitetura do sistema mais organizada, reutilizável, escalável e de fácil manutenção.

* Link do Figma para visualizar o protótipo: https://www.figma.com/design/dE4rMIj3fzbXqDITzMmSbM/Sem-t%C3%ADtulo?node-id=0-1&t=4eweeq9jkEhgGBJP-1
