import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Check, CheckCheck, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messageService, swapService } from '../services/api';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { swapId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinRoom, leaveRoom, sendMessage: socketSend, markRead } = useSocket();
  const [messages, setMessages] = useState([]);
  const [swap, setSwap] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [swapRes, msgRes] = await Promise.all([
          swapService.getSwap(swapId),
          messageService.getMessages(swapId),
        ]);
        setSwap(swapRes.data.swap);
        setMessages(msgRes.data.messages || []);
      } catch (e) {
        toast.error('Failed to load chat');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    joinRoom(swapId);
    return () => leaveRoom(swapId);
  }, [swapId]);

  useEffect(() => {
    if (!socket) return;

    const onMsg = (msg) => {
      if (msg.swap === swapId || msg.swapId === swapId) {
        setMessages(prev => [...prev, msg]);
        setOtherTyping(false);
      }
    };

    const onTyping = ({ userId: uid }) => {
      if (uid !== user?._id) setOtherTyping(true);
    };

    const onStopTyping = ({ userId: uid }) => {
      if (uid !== user?._id) setOtherTyping(false);
    };

    socket.on('newMessage', onMsg);
    socket.on('userTyping', onTyping);
    socket.on('userStopTyping', onStopTyping);

    return () => {
      socket.off('newMessage', onMsg);
      socket.off('userTyping', onTyping);
      socket.off('userStopTyping', onStopTyping);
    };
  }, [socket, swapId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const handleTyping = (val) => {
    setText(val);
    if (!socket) return;
    socket.emit('typing', { swapId, userId: user?._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { swapId, userId: user?._id });
    }, 1500);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;

    const optimistic = {
      _id: Date.now().toString(),
      content: text.trim(),
      sender: user,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setText('');
    setSending(true);

    try {
      const { data } = await messageService.sendMessage(swapId, text.trim());
      setMessages(prev => prev.map(m => m._id === optimistic._id ? data.message : m));
    } catch (e) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  const other = swap?.requester?._id === user?._id ? swap?.owner : swap?.requester;

  return (
    <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      {/* Chat Header */}
      <div style={{ background: 'white', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ background: 'rgba(27,94,32,0.08)', border: 'none', borderRadius: '10px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1B5E20' }}>
          <ArrowLeft size={18} />
        </button>

        <img src={other?.avatar || `https://ui-avatars.com/api/?name=${other?.name}&background=1B5E20&color=fff`}
          alt="" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #A5D6A7' }} />

        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>{other?.name}</p>
          <p style={{ fontSize: '0.75rem', color: otherTyping ? '#4DB6AC' : '#9CA3AF' }}>
            {otherTyping ? '✏️ typing...' : 'ReWear Chat'}
          </p>
        </div>

        {swap?.item && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.85rem', background: '#F9FBF9', borderRadius: '12px', border: '1px solid rgba(165,214,167,0.3)' }}>
            <img src={swap.item.images?.[0]?.url} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a1a2e' }}>{swap.item.title}</p>
              <p style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>🌿 {swap.item.pointsValue} pts</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto', color: '#9CA3AF' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💬</div>
            <p style={{ fontWeight: 600 }}>Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender?._id === user?._id;
          const showAvatar = !isMe && (i === 0 || messages[i - 1]?.sender?._id !== msg.sender?._id);
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 5, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: '0.5rem', alignItems: 'flex-end' }}
            >
              {!isMe && (
                <img src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.name}&background=1B5E20&color=fff`}
                  alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', visibility: showAvatar ? 'visible' : 'hidden', flexShrink: 0 }} />
              )}
              <div style={{
                maxWidth: '65%',
                padding: '0.75rem 1rem',
                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isMe ? 'linear-gradient(135deg, #1B5E20, #2E7D32)' : 'white',
                color: isMe ? 'white' : '#1a1a2e',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                opacity: msg._optimistic ? 0.75 : 1,
                wordBreak: 'break-word',
              }}>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{msg.content}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: isMe ? 'flex-end' : 'flex-start', marginTop: '0.3rem' }}>
                  <span style={{ fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.6)' : '#9CA3AF' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (msg._optimistic ? <Loader size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCheck size={12} color="rgba(255,255,255,0.7)" />)}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {otherTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ maxWidth: '80px', padding: '0.75rem 1rem', borderRadius: '18px 18px 18px 4px', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 0.15, 0.3].map((d, i) => (
                <motion.div key={i} animate={{ y: [-3, 0, -3] }} transition={{ duration: 0.8, delay: d, repeat: Infinity }}
                  style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF' }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend}
        style={{ background: 'white', borderTop: '1px solid #E5E7EB', padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
        <textarea
          value={text}
          onChange={e => handleTyping(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          rows={1}
          style={{
            flex: 1, padding: '0.75rem 1rem', border: '2px solid #E5E7EB', borderRadius: '16px',
            fontSize: '0.9rem', outline: 'none', resize: 'none', fontFamily: 'inherit',
            transition: 'border-color 0.2s', lineHeight: '1.5', maxHeight: '120px', overflowY: 'auto'
          }}
          onFocus={e => e.target.style.borderColor = '#1B5E20'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
        <motion.button type="submit" disabled={!text.trim() || sending}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '48px', height: '48px', borderRadius: '16px', border: 'none', cursor: 'pointer',
            background: text.trim() ? 'linear-gradient(135deg, #1B5E20, #2E7D32)' : '#E5E7EB',
            color: text.trim() ? 'white' : '#9CA3AF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s'
          }}>
          <Send size={20} />
        </motion.button>
      </form>
    </div>
  );
};

export default ChatPage;
