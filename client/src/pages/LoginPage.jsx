//client/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe o hook de navegação

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Inicialize o hook

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
        navigate('/chat'); 
      } else {
        setMessage(`Erro: ${data.message}`);
      }
    } catch (error) {
      setMessage('Erro: Não foi possível conectar ao servidor.');
    }
  };

  // O JSX do formulário continua o mesmo
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>CrypChat 🔐</h1>
        {message && <p className="status-message">{message}</p>}
        <div className="input-group">
          <label htmlFor="username">Login</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="login-btn">Entrar</button>
      </form>
    </div>
  );
}

export default LoginPage;