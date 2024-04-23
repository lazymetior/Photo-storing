const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const conn = require("../db/conn");
const bcrypt = require("bcrypt");
const GoogleStrategy = require("passport-google-oauth20").Strategy;


const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;




passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result = await conn.query("SELECT * FROM users WHERE email = $1", [
          profile.emails[0].value,
        ]);
        if (result.rows.length === 0) {
          const newUser = await conn.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
            [profile.displayName, profile.emails[0].value, "google"]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function verify(email, password, cb) {
      try {
        const result = await conn.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashedPassword = user.password;

          const valid = await bcrypt.compare(password, storedHashedPassword);

          if (valid) {
            console.log(user);
            // Save the user in the session
            return cb(null, user);
          } else {
            return cb(null, false, { message: "Incorrect password" });
          }
        } else {
          return cb(null, false, { message: "User not found" });
        }
      } catch (err) {
        console.error("Error in local strategy:", err);
        return cb(err);
      }
    }
  )
);





  
  
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});
