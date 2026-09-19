document.addEventListener('DOMContentLoaded', () => {
    const formFuncionario = document.getElementById('formFuncionario');
    const tabelaFuncionarios = document.getElementById('tabelaFuncionarios');
    const selectFornecedor = document.getElementById('id_fornecedor');
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

    if (selectFornecedor) {
        async function carregarFornecedoresNoSelect() {
            try {
                const resposta = await fetch('/fornecedores');
                const fornecedores = await resposta.json();

                if (!Array.isArray(fornecedores) || fornecedores.length === 0) {
                    selectFornecedor.innerHTML = '<option value="">Nenhum fornecedor disponível</option>';
                    return;
                }

                selectFornecedor.innerHTML = '<option value="">Selecione um fornecedor...</option>' +
                    fornecedores.map(f => `<option value="${f.id_fornecedor}">${f.nome_fornecedor} (CNPJ: ${f.cnpj})</option>`).join('');
            } catch (err) {
                selectFornecedor.innerHTML = '<option value="">Erro ao carregar fornecedores</option>';
            }
        }

        carregarFornecedoresNoSelect();
    }

    if (formFuncionario) {
        formFuncionario.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dados = {
                id_fornecedor: parseInt(selectFornecedor.value),
                nome_completo: document.getElementById('nome_completo').value.trim(),
                cpf_cnpj: document.getElementById('cpf_cnpj').value.trim(),
                telefone: document.getElementById('telefone').value.trim(),
                email: document.getElementById('email').value.trim(),
                funcao_exercida: document.getElementById('funcao_exercida').value.trim(),
                descricao_funcao: document.getElementById('descricao_funcao').value.trim() || null,
                data_nascimento: document.getElementById('data_nascimento').value || null,
                cidade: document.getElementById('cidade').value.trim() || null,
                estado: document.getElementById('estado').value.trim().toUpperCase() || null,
                nome_banco: document.getElementById('nome_banco').value.trim() || null,
                agencia: document.getElementById('agencia').value.trim() || null,
                tipo_conta: document.getElementById('tipo_conta').value || null,
                titular_conta: document.getElementById('titular_conta').value.trim() || null
            };

            try {
                const resposta = await fetch('/funcionarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    exibirMensagem('Funcionário cadastrado com sucesso.', 'success');
                    formFuncionario.reset();
                } else {
                    const erro = resultado.detail || 'Erro ao realizar cadastro do funcionário.';
                    exibirMensagem(erro, 'danger');
                }
            } catch (err) {
                exibirMensagem('Falha de comunicação com o servidor.', 'danger');
            }
        });
    }

    if (tabelaFuncionarios) {
        async function carregarFuncionarios() {
            try {
                const resposta = await fetch('/funcionarios');
                const funcionarios = await resposta.json();

                if (!Array.isArray(funcionarios) || funcionarios.length === 0) {
                    tabelaFuncionarios.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Nenhum funcionário cadastrado até o momento.</td></tr>';
                    return;
                }

                tabelaFuncionarios.innerHTML = funcionarios.map(f => `
                    <tr>
                        <td class="fw-bold text-secondary">#${f.id_funcionario}</td>
                        <td class="fw-semibold text-dark">${f.nome_completo}</td>
                        <td><span class="badge bg-light text-dark border">${f.funcao_exercida}</span></td>
                        <td>${f.cpf_cnpj}</td>
                        <td>${f.telefone}</td>
                        <td>${f.email}</td>
                        <td>Fornecedor #${f.id_fornecedor}</td>
                    </tr>
                `).join('');
            } catch (err) {
                tabelaFuncionarios.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">Erro ao carregar lista de funcionários.</td></tr>';
            }
        }

        carregarFuncionarios();
    }
});
