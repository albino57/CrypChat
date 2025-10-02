import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import { SocketProvider } from './context/SocketContext'; // Importe o Provider
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      {/* Envolvemos a ChatPage com o SocketProvider */}
      <Route 
        path="/chat" 
        element={
          <SocketProvider>
            <ChatPage />
          </SocketProvider>
        } 
      />
    </Routes>
  );
}

export default App;