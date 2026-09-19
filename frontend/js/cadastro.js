document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');
    const divMensagem = document.getElementById('mensagem');
    const radiosTipoPerfil = document.querySelectorAll('input[name="tipoPerfil"]');
    const secaoFornecedorCampos = document.getElementById('secaoFornecedorCampos');
    const grupoCpf = document.getElementById('grupoCpf');
    const inputCpf = document.getElementById('cpf');
    const inputCnpj = document.getElementById('cnpj');

    function alternarTipoPerfil() {
        const perfilSelecionado = document.querySelector('input[name="tipoPerfil"]:checked')?.value;
        if (perfilSelecionado === 'Fornecedor') {
            if (secaoFornecedorCampos) secaoFornecedorCampos.style.display = 'block';
            if (grupoCpf) grupoCpf.style.display = 'none';
            if (inputCpf) inputCpf.required = false;
            if (inputCnpj) inputCnpj.required = true;
        } else {
            if (secaoFornecedorCampos) secaoFornecedorCampos.style.display = 'none';
            if (grupoCpf) grupoCpf.style.display = 'block';
            if (inputCpf) inputCpf.required = true;
            if (inputCnpj) inputCnpj.required = false;
        }
    }

    radiosTipoPerfil.forEach((radio) => {
        radio.addEventListener('change', alternarTipoPerfil);
    });

    alternarTipoPerfil();

    function exibirMensagem(texto, tipo) {
        if (!divMensagem) return;
        divMensagem.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${texto}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();

            const senha = document.getElementById('senha').value;
            const confirmaSenha = document.getElementById('confirma_senha').value;

            if (senha !== confirmaSenha) {
                exibirMensagem('As senhas digitadas não coincidem.', 'warning');
                return;
            }

            const tipoPerfil = document.querySelector('input[name="tipoPerfil"]:checked')?.value || 'Cliente';
            const email = document.getElementById('email').value.trim();
            const nome = document.getElementById('nome').value.trim();
            const dataNascimento = document.getElementById('data_nascimento').value || null;
            const telefone = document.getElementById('telefone').value.trim();
            const cidade = document.getElementById('cidade').value.trim();
            const estado = document.getElementById('estado').value.trim().toUpperCase();
            const rua = document.getElementById('rua').value.trim() || null;
            const numero = document.getElementById('numero').value.trim() || null;
            const bairro = document.getElementById('bairro').value.trim() || null;
            const cep = document.getElementById('cep').value.trim() || null;

            let url = '/clientes';
            let payload = {};

            if (tipoPerfil === 'Cliente') {
                const cpf = inputCpf ? inputCpf.value.trim() : '';
                url = '/clientes';
                payload = {
                    email,
                    senha,
                    nome,
                    cpf,
                    telefone,
                    cidade,
                    estado,
                    data_nascimento: dataNascimento,
                    rua,
                    numero,
                    bairro,
                    cep,
                    complemento: null,
                    foto_perfil: null
                };
            } else {
                const cnpj = inputCnpj ? inputCnpj.value.trim() : '';
                const categoriaAtuacao = document.getElementById('categoria_atuacao')?.value || 'Geral';
                const nomeBanco = document.getElementById('nome_banco')?.value.trim() || null;
                const agencia = document.getElementById('agencia')?.value.trim() || null;
                const tipoConta = document.getElementById('tipo_conta')?.value || null;
                const titularConta = document.getElementById('titular_conta')?.value.trim() || null;

                url = '/fornecedores';
                payload = {
                    email,
                    senha,
                    nome_fornecedor: nome,
                    cnpj,
                    telefone,
                    categoria_atuacao: categoriaAtuacao,
                    cidade,
                    estado,
                    data_nascimento_responsavel: dataNascimento,
                    rua,
                    numero,
                    bairro,
                    cep,
                    complemento: null,
                    nome_banco: nomeBanco,
                    agencia,
                    tipo_conta: tipoConta,
                    titular_conta: titularConta,
                    foto_perfil: null
                };
            }

            try {
                const resposta = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    exibirMensagem('Cadastro realizado com sucesso! Redirecionando para o login...', 'success');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                } else {
                    let detalhe = 'Erro ao realizar cadastro.';
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
});
