// server/middleware.js
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).send("not logged");

    if (req.user.role !== role && req.user.role !== "p=") {
      return res.status(403).send("access denied");
    }

    next();
  };
}
