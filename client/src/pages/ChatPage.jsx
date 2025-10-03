import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MessageArea from '../components/MessageArea';
import MessageInput from '../components/MessageInput';

const API_BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_BACKEND_URL : '';

function ChatPage() {
  const socket = useSocket();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prevState => !prevState);
  };

  // --- EFEITO PRINCIPAL PARA CARREGAR DADOS ---
  useEffect(() => {
    // Primeiro, pegamos a informação do usuário que acabou de logar
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    setCurrentUser(loggedInUser);

    // Função para buscar a lista de contatos
    const fetchUsers = async () => {
      // Se não soubermos quem é o usuário logado, não fazemos nada.
      if (!loggedInUser) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Falha ao buscar usuários. A sessão pode ter expirado.');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Erro na busca de usuários:", error);
      }
    };

    fetchUsers(); // Executa a busca
  }, []); // Roda apenas uma vez na montagem do componente

  // --- EFEITO PARA O SOCKET ---
  useEffect(() => {
    if (!socket || !currentUser) return;

    const messageListener = (newMessage) => {
      // Adiciona a mensagem apenas se ela pertencer à conversa que está aberta
      setSelectedUser(prevSelectedUser => {
        const isChatOpen = (newMessage.author_id === prevSelectedUser?.id && newMessage.recipient_id === currentUser?.id) ||
                           (newMessage.author_id === currentUser?.id && newMessage.recipient_id === prevSelectedUser?.id);
        
        if (isChatOpen) {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        }
        return prevSelectedUser;
      });
    };
    
    socket.on('receive_message', messageListener);

    return () => {
      socket.off('receive_message', messageListener);
    };
  }, [socket, currentUser]); // Depende do socket e do currentUser estarem prontos

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${user.username}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Falha ao buscar o histórico de mensagens.');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Erro na busca de mensagens:", error);
    }
  };

  const handleSendMessage = (messageBody) => {
    if (!selectedUser || !socket) return;
    socket.emit('send_private_message', {
      recipient_id: selectedUser.id,
      body: messageBody,
    });
  };
  
  return (
    <div className={`container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Header 
        selectedUser={selectedUser} 
        onToggleSidebar={toggleSidebar} 
      />
      <Sidebar 
        users={users} 
        selectedUser={selectedUser} 
        onSelectUser={handleSelectUser} 
      />
      <MessageArea 
        messages={messages} 
        currentUser={currentUser} 
      />
      <MessageInput 
        onSendMessage={handleSendMessage} 
        selectedUser={selectedUser} 
      />
    </div>
  );
}

export default ChatPage;