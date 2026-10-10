import { useEffect, useMemo, useRef, useState } from 'react';
import { API, Session } from '../api';
import { useLive } from '../hooks/useLive';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';

export default function Chat() {
  const toast = useToast();
  const user = useMemo(() => Session.user(), []);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    API.get('/api/chat/messages').then(setMessages).catch((e) => toast(e.message, 'error'));
  }, [toast]);

  const clientRef = useLive('/topic/public',
    (body) => setMessages((list) => [...list, JSON.parse(body)]),
    setConnected);

  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [messages]);

  const send = (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !clientRef.current || !clientRef.current.connected) return;
    clientRef.current.publish({ destination: '/app/chat.send', body: JSON.stringify({ content }) });
    setText('');
  };

  return (
    <Layout user={user} narrow>
      <div className="page-head"><div>
        <h1>Apartment Community Chat</h1>
        <p className="muted">Chat with every resident, technician and the admin team in real time.</p>
      </div></div>

      <section className="card chat-card">
        <div className="chat-messages" ref={box}>
          {messages.map((m, i) => (
            <div key={i} className={'chat-msg' + (m.senderName === user.name ? ' chat-msg-me' : '')}>
              <div className="chat-msg-meta">
                <span className="chat-msg-name">{m.senderName}</span>
                <span className="chat-msg-flat">{m.senderFlat}</span>
                <span className="chat-msg-time">{m.time}</span>
              </div>
              <div className="chat-msg-bubble">{m.content}</div>
            </div>
          ))}
        </div>
        <form className="chat-input-row" onSubmit={send}>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message to the community..." autoComplete="off" required />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
        <p className="muted chat-status">{connected ? 'Connected — messages appear instantly for everyone online.' : 'Connecting…'}</p>
      </section>
    </Layout>
  );
}
