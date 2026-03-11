import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  const joinRoom = (swapId) => socketRef.current?.emit('room:join', swapId);
  const leaveRoom = (swapId) => socketRef.current?.emit('room:leave', swapId);
  const sendMessage = (swapId, content) =>
    socketRef.current?.emit('message:send', { swapId, content });
  const startTyping = (swapId) => socketRef.current?.emit('typing:start', { swapId });
  const stopTyping = (swapId) => socketRef.current?.emit('typing:stop', { swapId });

  const on = (event, handler) => socketRef.current?.on(event, handler);
  const off = (event, handler) => socketRef.current?.off(event, handler);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current, connected,
      joinRoom, leaveRoom, sendMessage, startTyping, stopTyping, on, off,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
