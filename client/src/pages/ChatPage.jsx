import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext'; // Importa nosso hook customizado do Context
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MessageArea from '../components/MessageArea';
import MessageInput from '../components/MessageInput';

//Note que para o ambiente local, a variável é uma string vazia ''. Isso porque, no vite.config.js, nós ainda temos o proxy que redireciona as chamadas /api para http://localhost:3001
const API_BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_BACKEND_URL : '';

function ChatPage() {
  // --- Hooks e Estado ---
  const socket = useSocket(); // Pega a instância do socket criada no nosso Context
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // --- Funções ---
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prevState => !prevState);
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    // Limpa as mensagens antigas antes de buscar as novas
    setMessages([]); 
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${user.username}`);
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
    
    // Envia a mensagem para o servidor via WebSocket
    socket.emit('send_private_message', {
      recipient_id: selectedUser.id,
      body: messageBody,
    });
  };

  // --- Efeitos ---
  useEffect(() => {
    // Busca os dados iniciais do usuário logado e da lista de contatos
    const fetchData = async () => {
      try {
        const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
        setCurrentUser(loggedInUser);
        
        const usersResponse = await fetch(`${API_BASE_URL}/api/users`);
        const usersData = await usersResponse.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Erro na busca de dados iniciais:", error);
      }
    };
    fetchData();
  }, []); // Roda apenas uma vez

  useEffect(() => {
    // Se o socket não estiver pronto, não faz nada
    if (!socket) return;

    // Listener para quando uma nova mensagem é recebida do servidor
    const messageListener = (newMessage) => {
      // Verifica se a mensagem recebida pertence à conversa que está aberta
      const isChatOpen = (newMessage.author_id === selectedUser?.id && newMessage.recipient_id === currentUser?.id) ||
                         (newMessage.author_id === currentUser?.id && newMessage.recipient_id === selectedUser?.id);
      
      if (isChatOpen) {
          setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    };
    
    socket.on('receive_message', messageListener);

    // Função de limpeza: remove o listener quando o componente é desmontado
    // Isso evita o bug das mensagens duplicadas
    return () => {
      socket.off('receive_message', messageListener);
    };
  }, [socket, selectedUser, currentUser]); // Dependências: re-executa se o socket, o usuário selecionado ou o usuário atual mudarem

  // --- Renderização ---
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