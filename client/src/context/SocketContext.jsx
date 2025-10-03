import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // A conexão só é criada DEPOIS do login, quando a info do usuário está no sessionStorage
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (user) {
      const newSocket = io({
        withCredentials: true,
      });
      setSocket(newSocket);

      // A limpeza acontece quando o usuário desloga ou fecha a aba
      return () => newSocket.close();
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}