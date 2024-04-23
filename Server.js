// Import the Express.js framework
const express = require("express");
const Router = require("./Routes/Router")
const cors = require("cors");
const passportSetup = require("./Routes/passport");
const passport = require("passport");
const authRoute = require("./Routes/Auth");
const cookieSession = require("cookie-session");




// Create an instance of the Express application
const app = express();

app.use((req, res, next) => {
  // Set Content Security Policy headers
  res.setHeader(`Content-Security-Policy', "font-src 'self' ${process.env.SERVER_URL}`);

  // Call next middleware
  next();
});

app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);



app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/uploads",express.static("./uploads"))



app.use( Router);


app.use("/auth", authRoute);




const port = process.env.PORT || 3001;

// Start the server and listen on the specified IP address and port
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});

