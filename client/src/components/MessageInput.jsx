import { useState } from 'react';

function MessageInput({ onSendMessage, selectedUser }) {
  const [text, setText] = useState('');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const messageBody = text.trim();
      if (messageBody) {
        onSendMessage(messageBody);
        setText('');
      }
    }
  };

  return (
    <footer className="message-input-area">
      <textarea
        placeholder={selectedUser ? "Digite sua mensagem..." : "Selecione um contato para conversar..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        // Desabilita a textarea se não houver um selectedUser
        disabled={!selectedUser}
      />
    </footer>
  );
}

export default MessageInput;