function MessageArea({ messages, currentUser }) {
  return (
    <main className="messages-area" id="messages-area">
      {messages.length === 0 ? (
        <p className="no-messages-placeholder">Selecione uma conversa para começar.</p>
      ) : (
        messages.map(message => (
          <div 
            key={message.id} 
            // CORREÇÃO: Usamos optional chaining (currentUser?.id) para evitar o crash
            className={`message ${message.author_id === currentUser?.id ? 'sent' : 'received'}`}
          >
            <div className="message-body">
              {message.body}
            </div>
          </div>
        ))
      )}
    </main>
  );
}

export default MessageArea;