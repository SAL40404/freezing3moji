// Auth real com GitHub OAuth
import passport from "passport";
import GitHubStrategy from "passport-github2";
import session from "express-session";
import { db } from "./db.js";

export function setupAuth(app) {
  // Session básica
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback"
      },
      (accessToken, refreshToken, profile, done) => {
        const username = profile.username;

        // owner fixo
        let role = "p-";
        if (username === "SAL40404") role = "p=";

        db.run(
          `INSERT OR IGNORE INTO users (username, role) VALUES (?, ?)`,
          [username, role]
        );

        db.get(
          `SELECT role FROM users WHERE username = ?`,
          [username],
          (err, row) => {
            done(null, {
              username,
              role: row?.role || role
            });
          }
        );
      }
    )
  );

  app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

  app.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => res.redirect("/")
  );

  app.get("/logout", (req, res) => {
    req.logout(() => {});
    res.redirect("/");
  });
}
