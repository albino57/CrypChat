// 1. Recebemos as props como argumento da função
function Sidebar({ users, selectedUser, onSelectUser }) {
  return (
    <aside className="contacts-sidebar">
      {/* 2. Usamos .map() para iterar sobre a lista de usuários */}
      {users.map(user => (
        // 3. O atributo 'key' é essencial para o React em listas
        <a 
          href="#" 
          key={user.id} 
          // 4. Adiciona a classe 'selected' se o usuário for o selecionado
          className={`contact ${selectedUser?.id === user.id ? 'selected' : ''}`}
          // 5. Chama a função onSelectUser quando o contato é clicado
          onClick={() => onSelectUser(user)}
        >
          <span className="contact-avatar">{user.username.charAt(0).toUpperCase()}</span>
          <span className="contact-name">{user.username}</span>
        </a>
      ))}
    </aside>
  );
}
export default Sidebar;