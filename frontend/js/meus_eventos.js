document.addEventListener('DOMContentLoaded', () => {
    const containerEventos = document.getElementById('containerEventos');
    const nomeUsuarioEl = document.getElementById('nomeUsuario');
    const btnSair = document.getElementById('btnSair');
    const filtroEventoTexto = document.getElementById('filtroEventoTexto');
    const mensagemAlerta = document.getElementById('mensagemAlerta');
    const btnConfirmarExclusao = document.getElementById('btnConfirmarExclusao');
    const modalElement = document.getElementById('modalExcluirEvento');
    const modalExcluir = modalElement ? new bootstrap.Modal(modalElement) : null;

    let eventosArmazenados = [];
    let eventoParaExcluirId = null;

    const usuarioJson = localStorage.getItem('heyevents_usuario');
    if (!usuarioJson) {
        window.location.href = '/login';
        return;
    }

    const usuario = JSON.parse(usuarioJson);

    if (nomeUsuarioEl) {
        nomeUsuarioEl.textContent = `Olá, ${usuario.nome || usuario.email}`;
    }

    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.removeItem('heyevents_usuario');
            window.location.href = '/';
        });
    }

    function exibirAlerta(texto, tipo) {
        if (!mensagemAlerta) return;
        mensagemAlerta.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${texto}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    function formatarDataHora(isoString) {
        if (!isoString) return 'Data não informada';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        return d.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function renderizarEventos(lista) {
        if (!containerEventos) return;

        if (!Array.isArray(lista) || lista.length === 0) {
            containerEventos.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-secondary fs-5 mb-2">Você ainda não possui eventos cadastrados.</p>
                    <p class="text-muted small">Clique no botão (+) abaixo para cadastrar seu primeiro evento na plataforma.</p>
                </div>
            `;
            return;
        }

        containerEventos.innerHTML = lista.map((ev) => {
            const dataInicio = formatarDataHora(ev.data_hora_inicio);
            const dataFim = formatarDataHora(ev.data_hora_termino);
            const orcamento = parseFloat(ev.orcamento_estimado || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const imagemHtml = (ev.fotos_urls && ev.fotos_urls.length > 0 && ev.fotos_urls[0])
                ? `<img src="${ev.fotos_urls[0]}" class="event-img" alt="${ev.nome_evento}">`
                : `<div class="event-img-placeholder"><span>${ev.nome_categoria || 'Evento'}</span></div>`;

            const categoriaTexto = ev.tipo_evento
                ? `${ev.tipo_evento} - ${ev.nome_categoria}`
                : (ev.nome_categoria || 'Geral');

            return `
                <div class="col-12 col-lg-10">
                    <div class="event-card">
                        <div class="row g-3 align-items-center">
                            <div class="col-md-3 text-center">
                                ${imagemHtml}
                            </div>
                            <div class="col-md-6">
                                <div class="mb-2">
                                    <span class="badge bg-light text-dark border me-1">${categoriaTexto}</span>
                                    <span class="badge bg-secondary me-1">${ev.formato}</span>
                                    <span class="badge bg-info text-dark">${ev.visibilidade}</span>
                                </div>
                                <h4 class="fw-bold text-dark mb-1">${ev.nome_evento}</h4>
                                <p class="text-secondary small mb-2">
                                    <strong>Início:</strong> ${dataInicio} &nbsp;|&nbsp; <strong>Término:</strong> ${dataFim}
                                </p>
                                <p class="text-muted small mb-2">
                                    ${ev.descricao_evento || 'Sem descrição informada para este evento.'}
                                </p>
                                <div class="small fw-semibold text-dark">
                                    Orçamento Estimado: <span class="text-success">${orcamento}</span>
                                </div>
                                ${ev.local_reservado
                                    ? `<div class="small fw-semibold text-dark mt-1">Local: <span class="text-primary">${ev.local_reservado}</span> <span class="badge bg-warning text-dark ms-1">${ev.status_reserva}</span></div>`
                                    : `<div class="small text-muted mt-1">Local: <span>Ainda não reservado</span> <a href="/#secaoEspacos" class="badge bg-success text-decoration-none ms-1">Alugar espaço na vitrine</a></div>`
                                }
                            </div>
                            <div class="col-md-3 text-md-end text-center d-flex flex-md-column gap-2 justify-content-center">
                                <a href="/cadastro-de-evento?id=${ev.id_evento}" class="btn btn-teal">Editar</a>
                                <button type="button" class="btn btn-coral btn-excluir" data-id="${ev.id_evento}">Excluir</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.btn-excluir').forEach((btn) => {
            btn.addEventListener('click', () => {
                eventoParaExcluirId = btn.getAttribute('data-id');
                if (modalExcluir) {
                    modalExcluir.show();
                }
            });
        });
    }

    async function carregarEventos() {
        try {
            const idCliente = usuario.id_perfil;
            if (!idCliente) {
                exibirAlerta('Identificador de cliente não encontrado na sessão.', 'danger');
                return;
            }

            const resposta = await fetch(`/eventos/cliente/${idCliente}`);
            if (!resposta.ok) {
                throw new Error('Falha ao obter eventos.');
            }

            eventosArmazenados = await resposta.json();
            renderizarEventos(eventosArmazenados);
        } catch (err) {
            if (containerEventos) {
                containerEventos.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <p class="text-danger">Não foi possível carregar os seus eventos no momento.</p>
                    </div>
                `;
            }
        }
    }

    if (btnConfirmarExclusao) {
        btnConfirmarExclusao.addEventListener('click', async () => {
            if (!eventoParaExcluirId) return;

            try {
                const resposta = await fetch(`/eventos/${eventoParaExcluirId}`, {
                    method: 'DELETE'
                });

                if (resposta.ok) {
                    if (modalExcluir) modalExcluir.hide();
                    exibirAlerta('Evento excluído com sucesso.', 'success');
                    carregarEventos();
                } else {
                    const dados = await resposta.json();
                    exibirAlerta(dados.detail || 'Não foi possível excluir o evento.', 'danger');
                }
            } catch (err) {
                exibirAlerta('Falha de conexão com o servidor ao excluir evento.', 'danger');
            }
        });
    }

    if (filtroEventoTexto) {
        filtroEventoTexto.addEventListener('input', (e) => {
            const busca = e.target.value.toLowerCase().trim();
            if (!busca) {
                renderizarEventos(eventosArmazenados);
                return;
            }

            const filtrados = eventosArmazenados.filter(ev => {
                const nome = (ev.nome_evento || '').toLowerCase();
                const categoria = (ev.nome_categoria || '').toLowerCase();
                const tipo = (ev.tipo_evento || '').toLowerCase();
                return nome.includes(busca) || categoria.includes(busca) || tipo.includes(busca);
            });

            renderizarEventos(filtrados);
        });
    }

    carregarEventos();
});
