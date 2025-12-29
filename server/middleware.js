// Verifica se o usuário tem a role necessária
export function requireRole(role) {
  return (req, res, next) => {
    // mock de login por enquanto
    const user = req.user;

    if (!user) return res.status(401).send("not logged");

    if (user.role !== role && user.role !== "p=") {
      return res.status(403).send("access denied");
    }

    next();
  };
}
