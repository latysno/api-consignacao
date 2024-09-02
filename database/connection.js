const {Pool} = require('pg');

const pool = new Pool ({
    host: 'localhost',
    port: '5432',
    user: 'localhost',
    password: 'slackware',
    database: 'ornamentacao' 
})

module.exports = pool;