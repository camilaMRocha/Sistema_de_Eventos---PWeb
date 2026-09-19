document.addEventListener('DOMContentLoaded', () => {
    const containerVitrine = document.getElementById('vitrineLocais');
    const formBusca = document.getElementById('formBusca');
    const inputCidade = document.getElementById('inputCidade');
    const areaAutenticacao = document.getElementById('areaAutenticacao');

    let locaisArmazenados = [];

    function verificarSessao() {
        if (!areaAutenticacao) return;

        const usuarioJson = localStorage.getItem('heyevents_usuario');
        if (usuarioJson) {
            try {
                const usuario = JSON.parse(usuarioJson);
                const painelUrl = usuario.tipo_usuario === 'Fornecedor'
                    ? '/visualizar-locais'
                    : (usuario.tipo_usuario === 'Administrador' ? '/status' : '/meus-eventos');

                areaAutenticacao.innerHTML = `
                    <div class="d-flex align-items-center gap-2">
                        <span class="text-light small">Olá, ${usuario.nome || usuario.email}</span>
                        <a href="${painelUrl}" class="btn btn-outline-light btn-sm">Meu Painel</a>
                        <button id="btnSair" class="btn btn-sm btn-danger">Sair</button>
                    </div>
                `;

                const btnSair = document.getElementById('btnSair');
                if (btnSair) {
                    btnSair.addEventListener('click', () => {
                        localStorage.removeItem('heyevents_usuario');
                        window.location.reload();
                    });
                }
            } catch (e) {
                localStorage.removeItem('heyevents_usuario');
            }
        } else {
            areaAutenticacao.innerHTML = `
                <div class="d-flex gap-2">
                    <a href="/login" class="btn btn-outline-light btn-sm px-3">Entrar</a>
                    <a href="/cadastro" class="btn btn-primary btn-sm px-3">Cadastrar-se</a>
                </div>
            `;
        }
    }

    function renderizarLocais(locais) {
        if (!containerVitrine) return;

        if (!Array.isArray(locais) || locais.length === 0) {
            containerVitrine.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h5 class="text-muted">Nenhum espaço encontrado com os critérios informados.</h5>
                    <p class="text-secondary small">Tente buscar por outra cidade ou termo.</p>
                </div>
            `;
            return;
        }

        containerVitrine.innerHTML = locais.map(l => {
            const precoFormatado = parseFloat(l.preco_diaria).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const categoriasTexto = l.categorias || 'Eventos em Geral';
            const avaliacaoTexto = l.total_avaliacoes > 0
                ? `Nota: ${l.nota_media} (${l.total_avaliacoes} avaliações)`
                : 'Sem avaliações ainda';

            return `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="local-card-img" style="background: linear-gradient(135deg, #008282 0%, #1e293b 100%); height: 180px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold;">
                            <span>${l.nome}</span>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <div class="mb-2">
                                <span class="badge bg-light text-dark border small">${categoriasTexto}</span>
                            </div>
                            <h5 class="card-title fw-bold text-dark mb-1">${l.nome}</h5>
                            <p class="text-muted small mb-2">${l.cidade} / ${l.estado}</p>

                            <div class="small text-secondary mb-3">
                                <span>Capacidade: ${l.capacidade || 0} pessoas</span> · 
                                <span>Área: ${l.metragem} m²</span>
                            </div>

                            <div class="small text-muted mb-3">
                                ${avaliacaoTexto}
                            </div>

                            <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="d-block small text-muted">A partir de</span>
                                    <span class="price-tag fw-bold text-success">${precoFormatado}</span>
                                    <span class="small text-muted">/dia</span>
                                </div>
                                <a href="/reserva?id_local=${l.id_local}" class="btn btn-teal btn-sm px-3 fw-semibold">Reservar</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function carregarLocais(cidade = '') {
        if (!containerVitrine) return;

        containerVitrine.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Carregando espaços disponíveis...</p>
            </div>
        `;

        try {
            let url = '/locais';
            if (cidade) {
                url += `?cidade=${encodeURIComponent(cidade)}`;
            }

            const resposta = await fetch(url);
            const locais = await resposta.json();

            if (Array.isArray(locais)) {
                locaisArmazenados = locais;
                renderizarLocais(locaisArmazenados);
            } else {
                renderizarLocais([]);
            }
        } catch (err) {
            containerVitrine.innerHTML = `
                <div class="col-12 text-center py-5 text-danger">
                    <p>Erro ao carregar os espaços. Verifique a conexão com o servidor.</p>
                </div>
            `;
        }
    }

    // Filtro em Tempo Real na barra de pesquisa da vitrine (padrao de sala de aula)
    if (inputCidade) {
        inputCidade.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            if (!termo) {
                renderizarLocais(locaisArmazenados);
                return;
            }

            const filtrados = locaisArmazenados.filter(l => {
                const cidade = (l.cidade || '').toLowerCase();
                const estado = (l.estado || '').toLowerCase();
                const nome = (l.nome || '').toLowerCase();
                const categorias = (l.categorias || '').toLowerCase();
                return cidade.includes(termo) || estado.includes(termo) || nome.includes(termo) || categorias.includes(termo);
            });

            renderizarLocais(filtrados);
        });
    }

    if (formBusca) {
        formBusca.addEventListener('submit', (e) => {
            e.preventDefault();
            const cidade = inputCidade ? inputCidade.value.trim() : '';
            carregarLocais(cidade);
        });
    }

    verificarSessao();
    carregarLocais();
});
