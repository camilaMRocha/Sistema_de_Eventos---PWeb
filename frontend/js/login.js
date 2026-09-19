document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');
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

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;

            try {
                const resposta = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    exibirMensagem('Login realizado com sucesso. Redirecionando...', 'success');
                    localStorage.setItem('heyevents_usuario', JSON.stringify(resultado));

                    setTimeout(() => {
                        if (resultado.tipo_usuario === 'Fornecedor') {
                            window.location.href = '/visualizar-locais';
                        } else if (resultado.tipo_usuario === 'Administrador') {
                            window.location.href = '/visualizar-fornecedores';
                        } else {
                            window.location.href = '/';
                        }
                    }, 1000);
                } else {
                    const erro = resultado.detail || 'E-mail ou senha incorretos.';
                    exibirMensagem(erro, 'danger');
                }
            } catch (err) {
                exibirMensagem('Falha de comunicação com o servidor.', 'danger');
            }
        });
    }
});
