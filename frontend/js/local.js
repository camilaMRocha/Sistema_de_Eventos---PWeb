document.addEventListener('DOMContentLoaded', () => {
    const formLocal = document.getElementById('formLocal');
    const tabelaLocais = document.getElementById('tabelaLocais');
    const selectFornecedor = document.getElementById('id_fornecedor');
    const selectCategorias = document.getElementById('categorias_select');
    const divMensagem = document.getElementById('mensagem');
    const filtroLocal = document.getElementById('filtroLocal');
    const tituloCadastroLocal = document.getElementById('tituloCadastroLocal');
    const btnSalvarLocal = document.getElementById('btnSalvarLocal');
    const modalElement = document.getElementById('modalExcluirLocal');
    const modalExcluir = modalElement ? new bootstrap.Modal(modalElement) : null;
    const btnConfirmarExclusaoLocal = document.getElementById('btnConfirmarExclusaoLocal');

    let locaisArmazenados = [];
    let localParaExcluirId = null;

    function exibirMensagem(texto, tipo) {
        if (!divMensagem) return;
        divMensagem.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${texto}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    // Identifica se estamos em modo de edicao via parametro na URL (?id=...)
    const params = new URLSearchParams(window.location.search);
    const idLocalEdicao = params.get('id');

    if (formLocal) {
        async function inicializarFormulario() {
            let idFornecedorPadrao = null;
            const usuarioJson = localStorage.getItem('heyevents_usuario');
            if (usuarioJson) {
                try {
                    const usuario = JSON.parse(usuarioJson);
                    if (usuario.tipo_usuario === 'Fornecedor' && usuario.id_perfil) {
                        idFornecedorPadrao = usuario.id_perfil;
                    }
                } catch (e) {
                    console.error('Erro ao ler usuario da sessao:', e);
                }
            }

            // 1. Carregar Fornecedores
            if (selectFornecedor) {
                try {
                    const resposta = await fetch('/fornecedores');
                    const fornecedores = await resposta.json();

                    if (Array.isArray(fornecedores) && fornecedores.length > 0) {
                        selectFornecedor.innerHTML = '<option value="">Selecione um fornecedor...</option>' +
                            fornecedores.map(f => `<option value="${f.id_fornecedor}">${f.nome_fornecedor}</option>`).join('');

                        if (idFornecedorPadrao && !idLocalEdicao) {
                            selectFornecedor.value = idFornecedorPadrao;
                        }
                    } else {
                        selectFornecedor.innerHTML = '<option value="">Nenhum fornecedor disponível</option>';
                    }
                } catch (err) {
                    selectFornecedor.innerHTML = '<option value="">Erro ao carregar fornecedores</option>';
                }
            }

            // 2. Carregar Categorias
            if (selectCategorias) {
                try {
                    const resposta = await fetch('/categorias');
                    const categorias = await resposta.json();

                    if (Array.isArray(categorias) && categorias.length > 0) {
                        selectCategorias.innerHTML = categorias.map(c =>
                            `<option value="${c.id_categoria}">${c.nome_categoria}</option>`
                        ).join('');
                    } else {
                        selectCategorias.innerHTML = '<option value="">Nenhuma categoria cadastrada</option>';
                    }
                } catch (err) {
                    selectCategorias.innerHTML = '<option value="">Erro ao carregar categorias</option>';
                }
            }

            // 3. Se for modo de edicao, carregar dados existentes do local
            if (idLocalEdicao) {
                if (tituloCadastroLocal) {
                    tituloCadastroLocal.textContent = 'Edição do Espaço / Local para Eventos';
                }
                if (btnSalvarLocal) {
                    btnSalvarLocal.textContent = 'Salvar Alterações';
                }

                try {
                    const respostaLocal = await fetch(`/locais/${idLocalEdicao}`);
                    if (respostaLocal.ok) {
                        const local = await respostaLocal.json();

                        document.getElementById('nome').value = local.nome || '';
                        document.getElementById('capacidade').value = local.capacidade || '';
                        document.getElementById('preco_diaria').value = local.preco_diaria || '';
                        document.getElementById('metragem').value = local.metragem || '';
                        document.getElementById('quartos').value = local.quartos || 0;
                        document.getElementById('banheiros').value = local.banheiros || 0;
                        document.getElementById('vagas_estacionamento').value = local.vagas_estacionamento || 0;
                        document.getElementById('cidade').value = local.cidade || '';
                        document.getElementById('estado').value = local.estado || '';
                        document.getElementById('descricao').value = local.descricao || '';
                    } else {
                        exibirMensagem('Local não encontrado para edição.', 'danger');
                    }
                } catch (err) {
                    exibirMensagem('Erro ao obter dados do local para edição.', 'danger');
                }
            }
        }

        inicializarFormulario();

        formLocal.addEventListener('submit', async (e) => {
            e.preventDefault();

            const categoriasSelecionadas = selectCategorias ? Array.from(selectCategorias.selectedOptions)
                .map(opt => parseInt(opt.value))
                .filter(val => !isNaN(val)) : [];

            const idFornecedor = selectFornecedor ? parseInt(selectFornecedor.value) : null;
            if (!idFornecedor && !idLocalEdicao) {
                exibirMensagem('Por favor, selecione um fornecedor.', 'warning');
                return;
            }

            const dados = {
                id_fornecedor: idFornecedor,
                nome: document.getElementById('nome').value.trim(),
                capacidade: parseInt(document.getElementById('capacidade').value),
                preco_diaria: parseFloat(document.getElementById('preco_diaria').value),
                metragem: parseFloat(document.getElementById('metragem').value),
                quartos: parseInt(document.getElementById('quartos').value) || 0,
                banheiros: parseInt(document.getElementById('banheiros').value) || 0,
                vagas_estacionamento: parseInt(document.getElementById('vagas_estacionamento').value) || 0,
                rua: document.getElementById('rua') ? document.getElementById('rua').value.trim() : '',
                numero: document.getElementById('numero') ? document.getElementById('numero').value.trim() : '',
                bairro: document.getElementById('bairro') ? document.getElementById('bairro').value.trim() : '',
                cidade: document.getElementById('cidade').value.trim(),
                estado: document.getElementById('estado').value.trim().toUpperCase(),
                cep: document.getElementById('cep') ? document.getElementById('cep').value.trim() : '',
                complemento: document.getElementById('complemento') ? document.getElementById('complemento').value.trim() || null : null,
                descricao: document.getElementById('descricao').value.trim() || null,
                categorias_ids: categoriasSelecionadas.length > 0 ? categoriasSelecionadas : null
            };

            let url = '/locais';
            let metodo = 'POST';

            if (idLocalEdicao) {
                url = `/locais/${idLocalEdicao}`;
                metodo = 'PUT';
            }

            try {
                const resposta = await fetch(url, {
                    method: metodo,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    const textoSucesso = idLocalEdicao
                        ? 'Local atualizado com sucesso.'
                        : 'Local cadastrado com sucesso.';
                    exibirMensagem(textoSucesso, 'success');

                    setTimeout(() => {
                        window.location.href = '/visualizar-locais';
                    }, 1200);
                } else {
                    let detalhe = 'Erro ao salvar local.';
                    if (resultado.detail) {
                        if (Array.isArray(resultado.detail)) {
                            detalhe = resultado.detail.map(item => item.msg).join(', ');
                        } else {
                            detalhe = resultado.detail;
                        }
                    }
                    exibirMensagem(detalhe, 'danger');
                }
            } catch (err) {
                exibirMensagem('Falha de comunicação com o servidor.', 'danger');
            }
        });
    }

    if (tabelaLocais) {
        function renderizarTabela(locais) {
            if (!Array.isArray(locais) || locais.length === 0) {
                tabelaLocais.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">Nenhum local encontrado.</td></tr>';
                return;
            }

            tabelaLocais.innerHTML = locais.map(l => `
                <tr>
                    <td class="fw-bold text-secondary">#${l.id_local}</td>
                    <td class="fw-semibold text-dark">${l.nome}</td>
                    <td>${l.cidade}/${l.estado}</td>
                    <td><span class="badge bg-light text-dark border">${l.capacidade || 0} pessoas</span></td>
                    <td>${l.metragem} m²</td>
                    <td class="text-success fw-bold">R$ ${parseFloat(l.preco_diaria).toFixed(2)}</td>
                    <td>${l.proprietario || 'Não informado'}</td>
                    <td>${l.contato_proprietario || 'Não informado'}</td>
                    <td class="text-center">
                        <a href="/cadastro-de-local?id=${l.id_local}" class="btn btn-sm btn-teal me-1">Editar</a>
                        <button type="button" class="btn btn-sm btn-danger btn-excluir-local" data-id="${l.id_local}">Excluir</button>
                    </td>
                </tr>
            `).join('');

            // Adicionar evento aos botoes de exclusao
            document.querySelectorAll('.btn-excluir-local').forEach(btn => {
                btn.addEventListener('click', () => {
                    localParaExcluirId = btn.getAttribute('data-id');
                    if (modalExcluir) {
                        modalExcluir.show();
                    }
                });
            });
        }

        async function carregarLocais() {
            try {
                const resposta = await fetch('/locais');
                const locais = await resposta.json();

                if (Array.isArray(locais)) {
                    locaisArmazenados = locais;
                    renderizarTabela(locaisArmazenados);
                } else {
                    tabelaLocais.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">Nenhum local cadastrado até o momento.</td></tr>';
                }
            } catch (err) {
                tabelaLocais.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-danger">Erro ao carregar lista de locais.</td></tr>';
            }
        }

        // Filtro em Tempo Real (padrao de sala de aula com evento input)
        if (filtroLocal) {
            filtroLocal.addEventListener('input', (e) => {
                const termo = e.target.value.toLowerCase().trim();
                if (!termo) {
                    renderizarTabela(locaisArmazenados);
                    return;
                }

                const filtrados = locaisArmazenados.filter(l => {
                    const nome = (l.nome || '').toLowerCase();
                    const cidade = (l.cidade || '').toLowerCase();
                    const estado = (l.estado || '').toLowerCase();
                    const proprietario = (l.proprietario || '').toLowerCase();
                    return nome.includes(termo) || cidade.includes(termo) || estado.includes(termo) || proprietario.includes(termo);
                });

                renderizarTabela(filtrados);
            });
        }

        if (btnConfirmarExclusaoLocal) {
            btnConfirmarExclusaoLocal.addEventListener('click', async () => {
                if (!localParaExcluirId) return;

                try {
                    const resposta = await fetch(`/locais/${localParaExcluirId}`, {
                        method: 'DELETE'
                    });

                    if (resposta.ok) {
                        if (modalExcluir) modalExcluir.hide();
                        exibirMensagem('Local excluído com sucesso.', 'success');
                        carregarLocais();
                    } else {
                        const dados = await resposta.json();
                        exibirMensagem(dados.detail || 'Não foi possível excluir o local.', 'danger');
                    }
                } catch (err) {
                    exibirMensagem('Falha de comunicação com o servidor ao excluir local.', 'danger');
                }
            });
        }

        carregarLocais();
    }
});
