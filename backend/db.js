const mysql = require("mysql2");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? process.env.DB_PASS ?? "",
  database: process.env.DB_NAME || "penomoran_surat",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  timezone: "+07:00",
});

const db = pool.promise();

module.exports = db;
