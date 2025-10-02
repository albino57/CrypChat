//client/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe o hook de navegação
import styles from './LoginPage.module.css'; //Importando o CSS Module

//No ambiente local, a variável é uma string vazia ''. Isso porque, no vite.config.js, nós ainda temos o proxy que redireciona as chamadas /api para http://localhost:3001
const API_BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_BACKEND_URL : '';

// --- Componente do Modal de Registro ---
function RegisterModal({ onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      setMessage(data.message); //Exibe a mensagem de sucesso ou erro
      if (response.ok) {
        //Opcional: fechar o modal e limpa os campos após o sucesso
        setTimeout(() => {
          onClose();
        }, 2000); //Fecha após 2 segundos
      }
    } catch (error) {
      setMessage("Erro ao conectar ao servidor.");
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <form className="login-form" onSubmit={handleRegister}>
          <button type="button" className="close-btn" onClick={onClose}>X</button>
          <h2>Criar Nova Conta</h2>
          {message && <p>{message}</p>}
          <div className="input-group">
            <label htmlFor="reg-username">Usuário</label>
            <input type="text" id="reg-username" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="reg-password">Senha</label>
            <input type="password" id="reg-password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login-btn">Registrar</button>
        </form>
      </div>
    </div>
  );
}

// --- Componente Principal da Página de Login ---
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false); //Estado para controlar o Modal
  const navigate = useNavigate(); // Inicialize o hook

  //Função de login
  const handleSubmit = async (event) => { 
    event.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
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

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>CrypChat 🔐</h1>
        {message && <p>{message}</p>}
        <div className="input-group">
          <label htmlFor="username">Login</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="login-btn">Entrar</button>
        <div className="login-footer">
          <p>Não tem uma conta? <button type="button" className="link-btn" onClick={() => setIsRegisterModalOpen(true)}>Crie uma agora</button></p>
        </div>
      </form>
      
      {/* O Modal só é renderizado se o estado for true */}
      {isRegisterModalOpen && <RegisterModal onClose={() => setIsRegisterModalOpen(false)} />}
    </div>
  );
}

export default LoginPage;