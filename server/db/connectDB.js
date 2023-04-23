const mysql = require('mysql');
const db = mysql.createConnection(
    {
        user: 'root',
        host: 'localhost',
        password: 'admin',
        database : 'mydb',
        dialect: "mysql",
        supportBigNumbers: true,
        bigNumberStrings: true,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
    }
)
module.exports = db;