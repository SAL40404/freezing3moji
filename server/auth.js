// Simula login via query ?user=sal&role=p+
export function fakeAuth(req, res, next) {
  const { user, role } = req.query;

  if (user && role) {
    req.user = {
      username: user,
      role: role
    };
  }

  next();
}
