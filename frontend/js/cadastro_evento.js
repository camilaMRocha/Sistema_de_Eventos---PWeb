document.addEventListener('DOMContentLoaded', async () => {
    const formEvento = document.getElementById('formEvento');
    const divMensagem = document.getElementById('mensagem');
    const tituloTela = document.getElementById('tituloTela');
    const btnSubmeter = document.getElementById('btnSubmeter');
    const selectTipoEvento = document.getElementById('tipo_evento_select');
    const selectCategoria = document.getElementById('id_categoria');
    const radiosTipoLocal = document.querySelectorAll('input[name="tipoLocal"]');
    const secaoLocalProprio = document.getElementById('secaoLocalProprio');

    const usuarioJson = localStorage.getItem('heyevents_usuario');
    if (!usuarioJson) {
        window.location.href = '/login';
        return;
    }

    const usuario = JSON.parse(usuarioJson);
    if (usuario.tipo_usuario !== 'Cliente') {
        alert('Esta área é exclusiva para clientes cadastrados.');
        window.location.href = '/';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const idEventoEdicao = params.get('id');

    let categoriasHierarquia = [];

    function exibirMensagem(texto, tipo) {
        if (!divMensagem) return;
        divMensagem.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${texto}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    radiosTipoLocal.forEach(radio => {
        radio.addEventListener('change', () => {
            if (secaoLocalProprio) {
                secaoLocalProprio.style.display = (radio.value === 'proprio') ? 'block' : 'none';
            }
        });
    });

    function popularCategorias(idPaiSelecionado, subcategoriaIdParaSelecionar = null) {
        if (!selectCategoria) return;
        selectCategoria.innerHTML = '<option value="">Selecione a categoria do evento...</option>';

        if (!idPaiSelecionado) return;

        const subcategorias = categoriasHierarquia.filter(c => c.id_categoria_pai == idPaiSelecionado);

        subcategorias.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub.id_categoria;
            opt.textContent = sub.subcategoria;
            if (subcategoriaIdParaSelecionar && sub.id_categoria == subcategoriaIdParaSelecionar) {
                opt.selected = true;
            }
            selectCategoria.appendChild(opt);
        });
    }

    try {
        const respostaCat = await fetch('/categorias/hierarquia');
        if (respostaCat.ok) {
            categoriasHierarquia = await respostaCat.json();

            const tiposPais = categoriasHierarquia.filter(c => c.id_categoria_pai === null);
            tiposPais.forEach(tipo => {
                const opt = document.createElement('option');
                opt.value = tipo.id_categoria;
                opt.textContent = tipo.subcategoria;
                selectTipoEvento.appendChild(opt);
            });

            selectTipoEvento.addEventListener('change', () => {
                popularCategorias(selectTipoEvento.value);
            });
        }
    } catch (err) {
        exibirMensagem('Não foi possível carregar as categorias de eventos.', 'warning');
    }

    function formatarParaInputDatetime(isoString) {
        if (!isoString) return '';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '';
        const pad = (num) => String(num).padStart(2, '0');
        const ano = d.getFullYear();
        const mes = pad(d.getMonth() + 1);
        const dia = pad(d.getDate());
        const hora = pad(d.getHours());
        const minuto = pad(d.getMinutes());
        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    }

    if (idEventoEdicao) {
        if (tituloTela) tituloTela.textContent = 'Alteração do evento';
        if (btnSubmeter) btnSubmeter.textContent = 'Salvar Alterações';

        try {
            const resposta = await fetch(`/eventos/${idEventoEdicao}`);
            if (resposta.ok) {
                const evento = await resposta.json();

                document.getElementById('nome_evento').value = evento.nome_evento || '';
                document.getElementById('formato').value = evento.formato || 'Presencial';
                document.getElementById('visibilidade').value = evento.visibilidade || 'Privado';

                const pad = (num) => String(num).padStart(2, '0');
                if (evento.data_hora_inicio) {
                    const dtIni = new Date(evento.data_hora_inicio);
                    if (!isNaN(dtIni.getTime())) {
                        document.getElementById('data_inicio').value = `${dtIni.getFullYear()}-${pad(dtIni.getMonth() + 1)}-${pad(dtIni.getDate())}`;
                        document.getElementById('hora_inicio').value = `${pad(dtIni.getHours())}:${pad(dtIni.getMinutes())}`;
                    }
                }
                if (evento.data_hora_termino) {
                    const dtFim = new Date(evento.data_hora_termino);
                    if (!isNaN(dtFim.getTime())) {
                        document.getElementById('data_termino').value = `${dtFim.getFullYear()}-${pad(dtFim.getMonth() + 1)}-${pad(dtFim.getDate())}`;
                        document.getElementById('hora_termino').value = `${pad(dtFim.getHours())}:${pad(dtFim.getMinutes())}`;
                    }
                }

                document.getElementById('descricao_evento').value = evento.descricao_evento || '';
                document.getElementById('orcamento_estimado').value = evento.orcamento_estimado || '';

                if (evento.fotos_urls && evento.fotos_urls.length > 0) {
                    document.getElementById('url_imagem').value = evento.fotos_urls[0];
                }

                const categoriaEncontrada = categoriasHierarquia.find(c => c.id_categoria == evento.id_categoria);
                if (categoriaEncontrada && categoriaEncontrada.id_categoria_pai) {
                    selectTipoEvento.value = categoriaEncontrada.id_categoria_pai;
                    popularCategorias(categoriaEncontrada.id_categoria_pai, evento.id_categoria);
                } else if (categoriaEncontrada) {
                    selectTipoEvento.value = categoriaEncontrada.id_categoria;
                    popularCategorias(categoriaEncontrada.id_categoria, evento.id_categoria);
                }
            } else {
                exibirMensagem('Evento não encontrado para edição.', 'danger');
            }
        } catch (err) {
            exibirMensagem('Erro ao carregar dados do evento.', 'danger');
        }
    }

    if (formEvento) {
        formEvento.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome_evento = document.getElementById('nome_evento').value.trim();
            const id_categoria = parseInt(selectCategoria.value);
            const formato = document.getElementById('formato').value;
            const visibilidade = document.getElementById('visibilidade').value;

            const data_inicio = document.getElementById('data_inicio').value;
            let hora_inicio = document.getElementById('hora_inicio').value || '19:00';
            if (hora_inicio.length === 4) hora_inicio = '0' + hora_inicio;
            if (hora_inicio.length === 5) hora_inicio += ':00';
            const data_hora_inicio = `${data_inicio}T${hora_inicio}`;

            const data_termino = document.getElementById('data_termino').value;
            let hora_termino = document.getElementById('hora_termino').value || '22:00';
            if (hora_termino.length === 4) hora_termino = '0' + hora_termino;
            if (hora_termino.length === 5) hora_termino += ':00';
            const data_hora_termino = `${data_termino}T${hora_termino}`;

            const descricao_evento = document.getElementById('descricao_evento').value.trim() || null;
            const orcamento_estimado = parseFloat(document.getElementById('orcamento_estimado').value || 0);
            const url_imagem = document.getElementById('url_imagem').value.trim();

            if (!id_categoria) {
                exibirMensagem('Por favor, selecione uma categoria para o evento.', 'warning');
                return;
            }

            if (new Date(data_hora_termino) <= new Date(data_hora_inicio)) {
                exibirMensagem('A data e horário de término devem ser posteriores ao início.', 'warning');
                return;
            }

            const fotos_urls = url_imagem ? [url_imagem] : [];

            let url = '/eventos';
            let metodo = 'POST';
            let payload = {};

            if (idEventoEdicao) {
                url = `/eventos/${idEventoEdicao}`;
                metodo = 'PUT';
                payload = {
                    nome_evento,
                    id_categoria,
                    formato,
                    visibilidade,
                    data_hora_inicio,
                    data_hora_termino,
                    descricao_evento,
                    orcamento_estimado,
                    fotos_urls
                };
            } else {
                url = '/eventos';
                metodo = 'POST';
                payload = {
                    id_cliente: usuario.id_perfil,
                    id_categoria,
                    nome_evento,
                    formato,
                    visibilidade,
                    data_hora_inicio,
                    data_hora_termino,
                    descricao_evento,
                    orcamento_estimado,
                    fotos_urls
                };
            }

            try {
                const resposta = await fetch(url, {
                    method: metodo,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    const msgSucesso = idEventoEdicao
                        ? 'Evento atualizado com sucesso! Redirecionando...'
                        : 'Evento cadastrado com sucesso! Redirecionando...';
                    exibirMensagem(msgSucesso, 'success');

                    setTimeout(() => {
                        window.location.href = '/meus-eventos';
                    }, 1200);
                } else {
                    const erro = resultado.detail || 'Não foi possível salvar o evento.';
                    exibirMensagem(erro, 'danger');
                }
            } catch (err) {
                exibirMensagem('Falha de conexão com o servidor.', 'danger');
            }
        });
    }
});
