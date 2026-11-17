export default function Footer() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer>
      <div className="container" style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.25rem' }}>
          &copy; {anoAtual} HeyEvents
        </p>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0 }}>
          Plataforma para organização e gestão de eventos. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
