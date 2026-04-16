const { Pool } = require('pg');

// console.log({
//   user: process.env.PG_USER,
//   password: process.env.PG_USER_PASSWORD,
//   host: process.env.PG_HOST,
//   db: process.env.PG_DB_NAME,
// });

// console.log("DB_PASSWORD:", JSON.stringify(process.env.PG_USER_PASSWORD));

// const pool = new Pool({
//     host: process.env.PG_HOST,
//     port: Number(process.env.PG_PORT),
//     user: process.env.PG_USER,
//     password: String(process.env.PG_USER.PASSWORD),
//     database: process.env.PG_DB_NAME
// });

const pool = new Pool({
    connectionString: process.env.PG_DB_URL
});

module.exports = pool;