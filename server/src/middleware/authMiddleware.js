// Este middleware verifica se o usuário tem uma sessão ativa
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    // Se o userId existir na sessão, o usuário está logado. Prossiga.
    return next();
  } else {
    // Se não, retorne um erro de "Não Autorizado"
    return res.status(401).json({ message: 'Acesso não autorizado. Por favor, faça login.' });
  }
};

module.exports = { isAuthenticated };