import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ selectedUser, onToggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    sessionStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="chat-header">
      <button id="toggle-sidebar-btn" onClick={onToggleSidebar}>☰</button>
      
      <h3 className="setup-title">
        CrypChat 🔐🔑: Conversando com {selectedUser ? selectedUser.username : '...'}
      </h3>

      <div className="setup-container">
          <button id="setup" className="setup-btn" title="Configurações" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <img src="/assets/wrench-setupREADY.png" alt="Setup" />
          </button>

          {isMenuOpen && (
            <div id="setup-menu" className="setup-menu show">
              <a href="#" className="menu-item">Meu Perfil</a>
              <a href="#" className="menu-item">Configurações</a>
              <hr />
              <a href="#" onClick={handleLogout} className="menu-item logout-item">Sair</a>
            </div>
          )}
      </div>
    </header>
  );
}

export default Header;