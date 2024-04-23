const pg = require('pg');
const env = require('dotenv');

env.config();

  const conn = new pg.Client({
    user: process.env.USER_NAME,
    host: "localhost",
    database: process.env.DATABASE,
    password: process.env.PSWD,
    port: process.env.DB_PORT,
  });
  conn.connect();

module.exports = conn;
