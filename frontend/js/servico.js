document.addEventListener('DOMContentLoaded', () => {
    const formServico = document.getElementById('formServico');
    const tabelaServicos = document.getElementById('tabelaServicos');
    const selectFornecedor = document.getElementById('id_fornecedor');
    const selectFuncionario = document.getElementById('id_funcionario');
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
        async function carregarFornecedores() {
            try {
                const resposta = await fetch('/fornecedores');
                const fornecedores = await resposta.json();

                if (!Array.isArray(fornecedores) || fornecedores.length === 0) {
                    selectFornecedor.innerHTML = '<option value="">Nenhum fornecedor disponível</option>';
                    return;
                }

                selectFornecedor.innerHTML = '<option value="">Selecione um fornecedor...</option>' +
                    fornecedores.map(f => `<option value="${f.id_fornecedor}">${f.nome_fornecedor}</option>`).join('');
            } catch (err) {
                selectFornecedor.innerHTML = '<option value="">Erro ao carregar fornecedores</option>';
            }
        }

        carregarFornecedores();

        if (selectFuncionario) {
            selectFornecedor.addEventListener('change', async () => {
                const idFornecedor = selectFornecedor.value;
                if (!idFornecedor) {
                    selectFuncionario.innerHTML = '<option value="">Selecione primeiro o fornecedor...</option>';
                    return;
                }

                try {
                    const resposta = await fetch(`/funcionarios/fornecedor/${idFornecedor}`);
                    const funcionarios = await resposta.json();

                    if (!Array.isArray(funcionarios) || funcionarios.length === 0) {
                        selectFuncionario.innerHTML = '<option value="">Nenhum funcionário cadastrado para este fornecedor</option>';
                        return;
                    }

                    selectFuncionario.innerHTML = '<option value="">Nenhum (sem funcionário específico)</option>' +
                        funcionarios.map(fu => `<option value="${fu.id_funcionario}">${fu.nome_completo} (${fu.funcao_exercida})</option>`).join('');
                } catch (err) {
                    selectFuncionario.innerHTML = '<option value="">Erro ao carregar funcionários</option>';
                }
            });
        }
    }

    if (formServico) {
        formServico.addEventListener('submit', async (e) => {
            e.preventDefault();

            const funcionarioVal = selectFuncionario ? selectFuncionario.value : '';

            const dados = {
                id_fornecedor: parseInt(selectFornecedor.value),
                nome: document.getElementById('nome').value.trim(),
                categoria: document.getElementById('categoria').value,
                preco: parseFloat(document.getElementById('preco').value),
                descricao: document.getElementById('descricao').value.trim() || null,
                id_funcionario: funcionarioVal ? parseInt(funcionarioVal) : null
            };

            try {
                const resposta = await fetch('/servicos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    exibirMensagem('Serviço cadastrado com sucesso.', 'success');
                    formServico.reset();
                    if (selectFuncionario) {
                        selectFuncionario.innerHTML = '<option value="">Selecione primeiro o fornecedor...</option>';
                    }
                } else {
                    const erro = resultado.detail || 'Erro ao cadastrar serviço.';
                    exibirMensagem(erro, 'danger');
                }
            } catch (err) {
                exibirMensagem('Falha de comunicação com o servidor.', 'danger');
            }
        });
    }

    if (tabelaServicos) {
        async function carregarServicos() {
            try {
                const resposta = await fetch('/servicos');
                const servicos = await resposta.json();

                if (!Array.isArray(servicos) || servicos.length === 0) {
                    tabelaServicos.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Nenhum serviço cadastrado até o momento.</td></tr>';
                    return;
                }

                tabelaServicos.innerHTML = servicos.map(s => `
                    <tr>
                        <td class="fw-bold text-secondary">#${s.id_servico}</td>
                        <td class="fw-semibold text-dark">${s.nome}</td>
                        <td><span class="badge bg-light text-dark border">${s.categoria}</span></td>
                        <td class="text-success fw-semibold">R$ ${parseFloat(s.preco).toFixed(2)}</td>
                        <td>${s.nome_fornecedor}</td>
                        <td>${s.funcionario_responsavel || '<span class="text-muted">Não informado</span>'}</td>
                    </tr>
                `).join('');
            } catch (err) {
                tabelaServicos.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-danger">Erro ao carregar lista de serviços.</td></tr>';
            }
        }

        carregarServicos();
    }
});
