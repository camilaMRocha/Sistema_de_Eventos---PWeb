document.addEventListener('DOMContentLoaded', () => {
    const formCliente = document.getElementById('formCliente');
    const tabelaClientes = document.getElementById('tabelaClientes');
    const divMensagem = document.getElementById('mensagem');

    function exibirMensagem(texto, tipo) {
        if (!divMensagem) return;
        divMensagem.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${texto}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    if (formCliente) {
        formCliente.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dados = {
                nome: document.getElementById('nome').value.trim(),
                cpf: document.getElementById('cpf').value.trim(),
                telefone: document.getElementById('telefone').value.trim(),
                email: document.getElementById('email').value.trim(),
                senha: document.getElementById('senha').value,
                cidade: document.getElementById('cidade').value.trim(),
                estado: document.getElementById('estado').value.trim().toUpperCase(),
                data_nascimento: document.getElementById('data_nascimento').value || null,
                rua: document.getElementById('rua').value.trim() || null,
                numero: document.getElementById('numero').value.trim() || null,
                bairro: document.getElementById('bairro').value.trim() || null,
                cep: document.getElementById('cep').value.trim() || null,
                complemento: document.getElementById('complemento').value.trim() || null
            };

            try {
                const resposta = await fetch('/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    exibirMensagem('Cliente cadastrado com sucesso.', 'success');
                    formCliente.reset();
                } else {
                    const erro = resultado.detail || 'Erro ao realizar cadastro.';
                    exibirMensagem(erro, 'danger');
                }
            } catch (err) {
                exibirMensagem('Falha de comunicação com o servidor.', 'danger');
            }
        });
    }

    if (tabelaClientes) {
        async function carregarClientes() {
            try {
                const resposta = await fetch('/clientes');
                const clientes = await resposta.json();

                if (!Array.isArray(clientes) || clientes.length === 0) {
                    tabelaClientes.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Nenhum cliente cadastrado até o momento.</td></tr>';
                    return;
                }

                tabelaClientes.innerHTML = clientes.map(c => `
                    <tr>
                        <td class="fw-bold text-secondary">#${c.id_cliente}</td>
                        <td class="fw-semibold text-dark">${c.nome}</td>
                        <td>${c.cpf}</td>
                        <td>${c.telefone}</td>
                        <td>${c.email}</td>
                        <td>${c.cidade}/${c.estado}</td>
                    </tr>
                `).join('');
            } catch (err) {
                tabelaClientes.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-danger">Erro ao carregar lista de clientes.</td></tr>';
            }
        }

        carregarClientes();
    }
});
