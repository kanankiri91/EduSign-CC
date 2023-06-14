const { Client } = require('pg');
require('dotenv').config();

const db = new Client({
    user: process.env.USER ||'postgres',
    host: process.env.HOST ||'34.128.77.103',
    database: process.env.DATABASE ||'postgres',
    password: process.env.PASSWORD ||'qwertyuiop[]\\',
    port: process.env.PORT_DB ||5432,
});

module.exports = db;        