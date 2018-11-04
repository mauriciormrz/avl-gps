require('../config/config');

const mysql = require('mysql');
const colors = require('colors');

class MySQL {

    constructor() {
        console.log(colors.magenta('Clase MySQL  inicializada'));
        this.cnn = mysql.createConnection({
            host: process.env.HOST_MYSQL,
            user: process.env.USER_MYSQL,
            password: process.env.PASSWORD_MYSQL,
            database: process.env.DATABASE_MYSQL
        });
        this.conectarDB();
    }

    conectarDB() {
        this.cnn.connect((err) => {
            if (err) {
                console.error(colors.magenta('Error Connecting: ' + err.stack));
                return;
            }
            this.conectado = true;
            console.log(colors.magenta('Base  Datos  MySQL online')); // + this.cnn.threadId)
        });
    }

    static get instance() {
        return this._instance || (this._instance = new this());
    }

    static ejecutarQuery(query, callback) {

        this.instance.cnn.query(query, (err, results, fields) => {
            if (err) {
                return callback(err);
            }
            callback(null, results, fields);
        });
    }

    static ejecutarQuery_Callback(query, callback) {

        this.instance.cnn.query(query, (err, results, fields) => {
            if (err) {
                return callback(err);
            }
            callback(null, results, fields);
        });
    }

    static ejecutarQuery_Promesa(query) {

        return new Promise((resolve, reject) => {
            this.instance.cnn.query(query, (err, results, fields) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });
    }

    static async ejecutarQuery_Async(query) {

        this.instance.cnn.query(query, (err, results, fields) => {
            if (err) {
                throw new Error(err);
            }
            return results;
        });
    }
}

module.exports = {
    MySQL
}