const { Pool } = require('pg');

// const pool = new Pool({
//     host: process.env.PG_HOST,
//     port: process.env.PG_PORT,
//     user: process.env.PG_USER,
//     password: process.env.PG_USER.PASSWORD,
//     database: process.env.PG_DB_NAME
// });

const pool = new Pool({
    connectionString: process.env.PG_DB_URL
});

module.exports = pool;