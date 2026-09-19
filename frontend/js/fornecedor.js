document.addEventListener('DOMContentLoaded', () => {
    const formFornecedor = document.getElementById('formFornecedor');
    const tabelaFornecedores = document.getElementById('tabelaFornecedores');
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

    if (formFornecedor) {
        formFornecedor.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dados = {
                nome_fornecedor: document.getElementById('nome_fornecedor').value.trim(),
                cnpj: document.getElementById('cnpj').value.trim(),
                telefone: document.getElementById('telefone').value.trim(),
                categoria_atuacao: document.getElementById('categoria_atuacao').value,
                email: document.getElementById('email').value.trim(),
                senha: document.getElementById('senha').value,
                cidade: document.getElementById('cidade').value.trim(),
                estado: document.getElementById('estado').value.trim().toUpperCase(),
                data_nascimento_responsavel: document.getElementById('data_nascimento_responsavel').value || null,
                rua: document.getElementById('rua').value.trim() || null,
                numero: document.getElementById('numero').value.trim() || null,
                bairro: document.getElementById('bairro').value.trim() || null,
                cep: document.getElementById('cep').value.trim() || null,
                complemento: document.getElementById('complemento').value.trim() || null,
                nome_banco: document.getElementById('nome_banco').value.trim() || null,
                agencia: document.getElementById('agencia').value.trim() || null,
                tipo_conta: document.getElementById('tipo_conta').value || null,
                titular_conta: document.getElementById('titular_conta').value.trim() || null
            };

            try {
                const resposta = await fetch('/fornecedores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    exibirMensagem('Fornecedor cadastrado com sucesso.', 'success');
                    formFornecedor.reset();
                } else {
                    const erro = resultado.detail || 'Erro ao realizar cadastro do fornecedor.';
                    exibirMensagem(erro, 'danger');
                }
            } catch (err) {
                exibirMensagem('Falha de comunicação com o servidor.', 'danger');
            }
        });
    }

    if (tabelaFornecedores) {
        async function carregarFornecedores() {
            try {
                const resposta = await fetch('/fornecedores');
                const fornecedores = await resposta.json();

                if (!Array.isArray(fornecedores) || fornecedores.length === 0) {
                    tabelaFornecedores.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Nenhum fornecedor cadastrado até o momento.</td></tr>';
                    return;
                }

                tabelaFornecedores.innerHTML = fornecedores.map(f => `
                    <tr>
                        <td class="fw-bold text-secondary">#${f.id_fornecedor}</td>
                        <td class="fw-semibold text-dark">${f.nome_fornecedor}</td>
                        <td>${f.cnpj}</td>
                        <td><span class="badge bg-light text-dark border">${f.categoria_atuacao}</span></td>
                        <td>${f.telefone}</td>
                        <td>${f.email}</td>
                        <td>${f.cidade}/${f.estado}</td>
                    </tr>
                `).join('');
            } catch (err) {
                tabelaFornecedores.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">Erro ao carregar lista de fornecedores.</td></tr>';
            }
        }

        carregarFornecedores();
    }
});
