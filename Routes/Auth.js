const router = require("express").Router();
const passport = require("passport");
const conn = require("../db/conn");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const CLIENT_URL = process.env.CLIENT_URL;

router.get("/login/success", (req, res) => {
  console.log(req.user);
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successfull",
      user: req.user,
      //   cookies: req.cookies
    });
  }
});





router.get("/login/failed", (req, res) => {
  console.log("Login failed route hit.");

  
  res.redirect(`${CLIENT_URL}login?message=Please try again`);
});





  router.get("/logout", (req, res) => {
    // console.log("i got hit : /")
    req.logout();
    res.redirect(CLIENT_URL);
  });

  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );


router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/auth/login/failed",
  })
);


// Change this part in your server-side code




router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login/failed' }),
  function(req, res) {
    console.log(req.user);
    res.redirect(CLIENT_URL);
  });





  
router.post("/signup", async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await conn.query("SELECT * FROM users WHERE email = $1", [email]);

    if (checkResult.rows.length > 0) {
      console.log("User already exists.");
      return res.status(409).json({ status: 409, error: 'User already exists' });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    const result = await conn.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *", [username, email, hash]);
    const user = result.rows[0];

    // You can choose to send a response instead of redirecting
    res.status(201).json({ status: 201, message: 'Signup successful', user });

    // If you still want to log in the user immediately
    // req.login(user, (err) => {
    //   if (err) {
    //     console.error("Error during login:", err);
    //     return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    //   }
    //   console.log("Signup successful");
    //   res.redirect(CLIENT_URL);
    // });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});


  module.exports = router