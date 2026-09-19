document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idLocal = params.get('id_local');

    const formReserva = document.getElementById('formReserva');
    const selectEvento = document.getElementById('selectEvento');
    const dataInicioReserva = document.getElementById('dataInicioReserva');
    const horaInicioReserva = document.getElementById('horaInicioReserva');
    const dataFimReserva = document.getElementById('dataFimReserva');
    const horaFimReserva = document.getElementById('horaFimReserva');
    const calculoDiasTexto = document.getElementById('calculoDiasTexto');
    const calculoPrecoUnitario = document.getElementById('calculoPrecoUnitario');
    const valorTotalReserva = document.getElementById('valorTotalReserva');
    const alertaReserva = document.getElementById('alertaReserva');
    const mensagemAlerta = document.getElementById('mensagemAlerta');
    const btnConfirmarReserva = document.getElementById('btnConfirmarReserva');
    const listaOcupacao = document.getElementById('listaOcupacao');
    const nomeUsuarioEl = document.getElementById('nomeUsuario');

    let precoDiariaLocal = 0;
    let localAtual = null;

    function exibirMensagem(texto, tipo) {
        if (!alertaReserva) return;
        alertaReserva.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert" aria-live="assertive">
                ${texto}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar alerta"></button>
            </div>
        `;
        alertaReserva.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (!idLocal) {
        if (mensagemAlerta) {
            mensagemAlerta.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Nenhum espaço selecionado. <a href="/" class="alert-link">Voltar para a vitrine</a>
                </div>
            `;
        }
        return;
    }

    // 1. Identificar Sessao do Usuario
    const usuarioJson = localStorage.getItem('heyevents_usuario');
    let usuarioLogado = null;
    if (usuarioJson) {
        try {
            usuarioLogado = JSON.parse(usuarioJson);
            if (nomeUsuarioEl) {
                nomeUsuarioEl.textContent = `Olá, ${usuarioLogado.nome || usuarioLogado.email}`;
            }
        } catch (e) {
            console.error('Erro na sessao:', e);
        }
    }

    // 2. Carregar Dados do Local
    try {
        const respostaLocal = await fetch(`/locais/${idLocal}`);
        if (!respostaLocal.ok) {
            throw new Error('Local não encontrado');
        }

        localAtual = await respostaLocal.json();
        precoDiariaLocal = parseFloat(localAtual.preco_diaria || 0);

        document.getElementById('nomeLocal').textContent = localAtual.nome;
        document.getElementById('descricaoLocal').textContent = localAtual.descricao || 'Espaço amplo e estruturado para receber o seu evento com conforto e segurança.';
        document.getElementById('diariaLocal').textContent = precoDiariaLocal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        document.getElementById('enderecoLocal').textContent = `${localAtual.cidade}/${localAtual.estado}`;
        document.getElementById('proprietarioLocal').textContent = localAtual.proprietario || 'Proprietário HeyEvents';
        document.getElementById('contatoLocal').textContent = `Contato: ${localAtual.contato_proprietario || 'Disponível no contrato'}`;

        const amenidadesContainer = document.getElementById('amenidadesLocal');
        if (amenidadesContainer) {
            amenidadesContainer.innerHTML = `
                <span class="amenity-badge">${localAtual.capacidade || 0} pessoas</span>
                <span class="amenity-badge">${localAtual.metragem} m²</span>
                <span class="amenity-badge">${localAtual.quartos || 0} quartos</span>
                <span class="amenity-badge">${localAtual.banheiros || 0} banheiros</span>
                <span class="amenity-badge">${localAtual.vagas_estacionamento || 0} vagas</span>
            `;
        }

        const badgesContainer = document.getElementById('badgesCategorias');
        if (badgesContainer) {
            const listaCats = localAtual.categorias ? localAtual.categorias.split(',') : ['Eventos em Geral'];
            badgesContainer.innerHTML = listaCats.map(cat => `<span class="badge bg-light text-dark border">${cat.trim()}</span>`).join('');
        }
    } catch (err) {
        if (mensagemAlerta) {
            mensagemAlerta.innerHTML = '<div class="alert alert-danger">Não foi possível carregar os detalhes deste espaço.</div>';
        }
        return;
    }

    // 3. Consultar Agenda e Reservas Existentes para este Local
    try {
        const respostaAgenda = await fetch(`/reservas/local/${idLocal}`);
        if (respostaAgenda.ok) {
            const reservasExistentes = await respostaAgenda.json();
            if (Array.isArray(reservasExistentes) && reservasExistentes.length > 0) {
                listaOcupacao.innerHTML = `
                    <div class="alert alert-warning py-2 px-3 mb-0">
                        <span class="fw-semibold d-block mb-1">Datas já reservadas para este local:</span>
                        <ul class="mb-0 ps-3">
                            ${reservasExistentes.map(r => {
                                const dtIni = new Date(r.data_hora_inicio).toLocaleDateString('pt-BR');
                                const dtFim = new Date(r.data_hora_fim).toLocaleDateString('pt-BR');
                                return `<li>De ${dtIni} até ${dtFim} (${r.status_reserva})</li>`;
                            }).join('')}
                        </ul>
                    </div>
                `;
            } else {
                listaOcupacao.innerHTML = '<span class="text-success fw-medium">Este espaço não possui reservas ativas no momento. Todas as datas estão livres!</span>';
            }
        }
    } catch (e) {
        listaOcupacao.innerHTML = '<span class="text-muted">Agenda liberada para consulta.</span>';
    }

    // 4. Carregar Eventos do Cliente para Vincular a Reserva
    if (!usuarioLogado || usuarioLogado.tipo_usuario !== 'Cliente') {
        selectEvento.innerHTML = '<option value="">Faça login como cliente para selecionar seus eventos</option>';
        selectEvento.disabled = true;
        if (btnConfirmarReserva) btnConfirmarReserva.disabled = true;

        exibirMensagem('Você precisa estar conectado em uma conta de <strong>Cliente</strong> para alugar este local. <a href="/login" class="alert-link">Fazer Login</a> ou <a href="/cadastro" class="alert-link">Cadastrar-se</a>', 'warning');
        return;
    }

    try {
        const idCliente = usuarioLogado.id_perfil;
        const respostaEventos = await fetch(`/eventos/cliente/${idCliente}`);
        if (respostaEventos.ok) {
            const eventos = await respostaEventos.json();

            if (!Array.isArray(eventos) || eventos.length === 0) {
                selectEvento.innerHTML = '<option value="">Você ainda não possui eventos cadastrados</option>';
                selectEvento.disabled = true;
                if (btnConfirmarReserva) btnConfirmarReserva.disabled = true;

                exibirMensagem('Você precisa cadastrar seu evento primeiro antes de alugar o espaço. <a href="/cadastro-de-evento" class="alert-link">Clique aqui para criar seu evento agora</a>.', 'info');
            } else {
                selectEvento.innerHTML = '<option value="">Selecione o evento que acontecerá aqui...</option>' +
                    eventos.map(ev => `<option value="${ev.id_evento}">${ev.nome_evento} (${ev.nome_categoria || 'Evento'})</option>`).join('');
            }
        }
    } catch (err) {
        selectEvento.innerHTML = '<option value="">Erro ao carregar seus eventos</option>';
    }

    // 5. Funções Auxiliares de Montagem de Data e Horário
    function formatarHoraPadrao(val, fallback) {
        if (!val) return fallback;
        val = val.trim();
        if (val.length === 4) return '0' + val;
        if (val.length === 5) return val;
        return fallback;
    }

    function montarDataHora(dataEl, horaEl, horaPadrao) {
        const data = dataEl ? dataEl.value : '';
        if (!data) return '';
        const hora = formatarHoraPadrao(horaEl ? horaEl.value : '', horaPadrao);
        return `${data}T${hora}:00`;
    }

    // 6. Calculo de Diarias e Valor Total em Tempo Real
    function atualizarCalculo() {
        if (!dataInicioReserva || !dataFimReserva) return;

        const dataIni = dataInicioReserva.value;
        const dataFim = dataFimReserva.value;

        if (!dataIni || !dataFim) {
            calculoDiasTexto.textContent = '1 diária';
            calculoPrecoUnitario.textContent = precoDiariaLocal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            valorTotalReserva.textContent = precoDiariaLocal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            return;
        }

        const strInicio = montarDataHora(dataInicioReserva, horaInicioReserva, '08:00');
        const strFim = montarDataHora(dataFimReserva, horaFimReserva, '22:00');

        const dInicio = new Date(strInicio);
        const dFim = new Date(strFim);

        if (isNaN(dInicio.getTime()) || isNaN(dFim.getTime()) || dFim <= dInicio) {
            calculoDiasTexto.textContent = 'Datas inválidas';
            valorTotalReserva.textContent = 'R$ 0,00';
            return;
        }

        const diffSegundos = (dFim - dInicio) / 1000;
        const dias = Math.max(1, Math.ceil(diffSegundos / 86400));
        const total = dias * precoDiariaLocal;

        calculoDiasTexto.textContent = `${dias} ${dias === 1 ? 'diária' : 'diárias'}`;
        calculoPrecoUnitario.textContent = `${dias} x ${precoDiariaLocal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
        valorTotalReserva.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    [dataInicioReserva, horaInicioReserva, dataFimReserva, horaFimReserva].forEach(el => {
        if (el) {
            el.addEventListener('input', atualizarCalculo);
            el.addEventListener('change', atualizarCalculo);
        }
    });

    // 7. Submissao do Formulario de Reserva
    if (formReserva) {
        formReserva.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id_evento = parseInt(selectEvento.value);
            if (!id_evento) {
                exibirMensagem('Por favor, selecione qual dos seus eventos será realizado neste espaço.', 'warning');
                selectEvento.focus();
                return;
            }

            if (!dataInicioReserva.value) {
                exibirMensagem('Por favor, preencha a data de início da reserva.', 'warning');
                dataInicioReserva.focus();
                return;
            }

            if (!dataFimReserva.value) {
                exibirMensagem('Por favor, preencha a data de término da reserva.', 'warning');
                dataFimReserva.focus();
                return;
            }

            const data_hora_inicio = montarDataHora(dataInicioReserva, horaInicioReserva, '08:00');
            const data_hora_fim = montarDataHora(dataFimReserva, horaFimReserva, '22:00');

            const dInicio = new Date(data_hora_inicio);
            const dFim = new Date(data_hora_fim);

            if (isNaN(dInicio.getTime())) {
                exibirMensagem('Data ou horário de início inválido.', 'warning');
                dataInicioReserva.focus();
                return;
            }

            if (isNaN(dFim.getTime())) {
                exibirMensagem('Data ou horário de término inválido.', 'warning');
                dataFimReserva.focus();
                return;
            }

            if (dFim <= dInicio) {
                exibirMensagem('A data e horário de término devem ser posteriores ao início.', 'warning');
                dataFimReserva.focus();
                return;
            }

            const diffSegundos = (dFim - dInicio) / 1000;
            const dias = Math.max(1, Math.ceil(diffSegundos / 86400));
            const valor_total = dias * precoDiariaLocal;

            const payload = {
                id_evento,
                id_local: parseInt(idLocal),
                data_hora_inicio,
                data_hora_fim,
                valor_total
            };

            btnConfirmarReserva.disabled = true;
            btnConfirmarReserva.textContent = 'Enviando reserva...';

            try {
                const resposta = await fetch('/reservas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    exibirMensagem('Reserva realizada com sucesso! O proprietário do espaço foi notificado da sua solicitação.', 'success');
                    setTimeout(() => {
                        window.location.href = '/meus-eventos';
                    }, 1800);
                } else {
                    btnConfirmarReserva.disabled = false;
                    btnConfirmarReserva.textContent = 'Confirmar Reserva';
                    exibirMensagem(resultado.detail || 'Não foi possível concluir a reserva.', 'danger');
                }
            } catch (err) {
                btnConfirmarReserva.disabled = false;
                btnConfirmarReserva.textContent = 'Confirmar Reserva';
                exibirMensagem('Falha de conexão com o servidor.', 'danger');
            }
        });
    }

    atualizarCalculo();
});
