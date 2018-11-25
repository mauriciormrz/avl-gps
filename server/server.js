require('./config/config');

const express = require('express'); // Web Server y servicios RESTFUL
const socketIO = require('socket.io'); // Web sockets
const http = require('http');
const colors = require('colors');
const path = require('path');

const { fechaHora, duracionMlsgs } = require('./utilidades/utilidades');

const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


// //  Servicios REST ===============================================
// app.use(require('./routes/usuario'));

// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/cafe', (err, res) => {

//     if (err) throw err;
//     console.log(colors.cyan('Base de datos Mongo online!'));
// });


//  Servidor Web =================================================
let webServer = http.createServer(app);
const publicPath = path.resolve(__dirname, '../public');

app.use(express.static(publicPath));

// IO = esta es la comunicacion del backend
module.exports.io = socketIO(webServer);
require('./sockets/socket-web');


//  UDP RUPTELA ====================================================
const dgram = require('dgram');

const { ruptela } = require('./classes/ruptela');

const ruptelaServer = dgram.createSocket('udp4');

// Escuchando UDP
ruptelaServer.on('listening', () => {

    const address = ruptelaServer.address();
    console.log(colors.green(`Servidor RUPTELA corriendo en puerto ${address.port}: ${address.address}`));
});

// Llega mensaje
ruptelaServer.on('message', (data, remoteHost) => {

    let inicio = new Date();
    console.log(colors.green(`\nRecibido: ${data} from ${remoteHost.port} ${fechaHora()}`));

    // Identificar origen y mensaje
    let { address, port } = remoteHost;

    //const msg = ruptela.getMensaje(data);
    // console.log(colors.red(msg));
    // if (!res.error) {
    //     //do something with res.data

    //     //return acknowledgement
    //     conn.write(res.ack);
    // } else {
    //     //do something with res.error
    // }

    ruptela.getMensaje(data, (imei, ack, posicion) => {

        if (vehiculos.getVehiculoByIMEI(imei)) { // IMEI en la base de datos

            if (vehiculos.updateRemoteHost(imei, { address, port })) { // Cambió la ip o el puerto

                // Actualiza tabla avl_unidades
                MySQL.ejecutarQuery(`UPDATE avl_unidades SET ip='${address}', puerto='${port}' WHERE imei = '${imei}'`, (err, results) => { if (err) console.log(err.stack); });
            }
        } else { // IMEI no existe en la base de datos

            // Ingreso a  tabla avl_unidades
            MySQL.ejecutarQuery(`INSERT INTO avl_unidades(unidad_id, imei, ip, puerto, tipo) VALUE('${imei}','${imei}','${address}','${port}','Ruptela');`, (err, results) => { if (err) console.log(err.stack); });

            // Ingreso a tabla avl_vehiculos
            MySQL.ejecutarQuery(`INSERT INTO avl_vehiculos(vehiculo_id, unidad_id, Placa, nombre,fecha_activo) VALUE('${imei}','${imei}','${imei}','${imei}', NOW());`, (err, results) => { if (err) console.log(err.stack); });

            // Recarga vector vehículos 
            MySQL.ejecutarQuery("SELECT * FROM avl_vehiculos_view", (err, results) => {
                if (err) console.log(err.stack);
                vehiculos.cargarVehiculos(results);
            });
        }

        if (posicion) { // Si el mensaje es de posición
            // Geocod-Reverse
            let inicio = new Date();
            geocod.getUbicacion(posicion, new Date())
                .then(() => {

                    console.log(colors.red(duracionMlsgs(`getUbicacion: ${posicion.ubicacion}`, inicio)));

                    // Graba gps_posiciones
                    MySQL.ejecutarQuery(`CALL gps_posiciones_reportes_procedure(${ruptela.parametrosInsert(posicion)});`, (err, results) => {
                        if (err) console.log(err.stack);
                        console.log(colors.magenta(`Grabado : ${vehiculos.getVehiculoByIMEI(imei).unidad_ip} ${fechaHora()}  ${duracionMlsgs('', inicio)}`));
                    });

                    console.log(`Transmite clientes web ${duracionMlsgs('', inicio)}`);
                })
                .catch(err => { console.log(err); });
        }

        // Envia acknowledge
        ruptelaServer.send(ack, 0, ack.length, port, address, (err, bytes) => {
            if (err) {
                console.log(err.stack);
            }
            console.log(colors.green(`Enviado : ${ack} to ${imei}  ${address}: ${port}${duracionMlsgs('', inicio)}\n`));
        });
    });
});

ruptelaServer.on('error', (err) => {
    console.log(err.stack);
    ruptelaServer.close();
});


//  UDP Enfora ====================================================
const enforaServer = dgram.createSocket('udp4');

enforaServer.on('listening', () => {
    const address = enforaServer.address();

    console.log(colors.yellow(`Servidor ENFORA  corriendo en puerto ${address.port}: ${address.address}`));

});

enforaServer.on('message', (msg, rinfo) => {

    console.log(colors.green(`Recibido: ${msg} from ${rinfo.address}:${rinfo.port}`));
    const reply = new Buffer('Hello Client');

    enforaServer.send(reply, 0, reply.length, rinfo.port, rinfo.address, (err, bytes) => {
        if (err) {
            console.log(err.stack);
        }
        console.log(`Enviado : ${reply} to   ${rinfo.address}:${rinfo.port}`);
    });
});

enforaServer.on('error', (err) => {
    console.log(err.stack);
    enforaServer.close();
});


//  UDP App ====================================================
const appServer = dgram.createSocket('udp4');

appServer.on('listening', () => {
    const address = appServer.address();

    console.log(colors.yellow(`Servidor APP     corriendo en puerto ${address.port}: ${address.address}`));
    console.log(`===========================================================`);

});

appServer.on('message', (msg, rinfo) => {

    console.log(colors.green(`Recibido: ${msg} from ${rinfo.address}:${rinfo.port}`));
    const reply = new Buffer('Hello Client');

    appServer.send(reply, 0, reply.length, rinfo.port, rinfo.address, (err, bytes) => {
        if (err) {
            console.log(err.stack);
        }
        console.log(`Enviado : ${reply} to   ${rinfo.address}:${rinfo.port}`);
    });
});

appServer.on('error', (err) => {
    console.log(err.stack);
    appServer.close();
});


//  Conexión MySQL ================================================
const { MySQL } = require('./mysql/mysql');

const { Vehiculos } = require('./classes/vehiculos');
let vehiculos = new Vehiculos();

const { Geocod } = require('./classes/geocod');
let geocod;


console.log(`\n===========================================================`);
console.log(`${colors.cyan(fechaHora())}\n`);

// Iniciar lista de Vehículos
MySQL.ejecutarQuery("SELECT * FROM avl_vehiculos_view", (err, results) => {

    if (err) console.log(err.stack);

    webServer.listen(process.env.WEB_PORT, (err) => { // Iniciar Servidor Web Sockets

        if (err) throw new Error(err);
        vehiculos.cargarVehiculos(results);
        console.log(colors.white(`\nServidor WEB     corriendo en puerto ${ process.env.WEB_PORT }`));
    });

    //geocod = new Geocod();
    ruptelaServer.bind(process.env.RUPTELA_PORT, process.env.UDP_HOST); // Iniciar Servidor Ruptela
    enforaServer.bind(process.env.ENFORA_PORT, process.env.UDP_HOST); // Iniciar Servidor Enfora
    appServer.bind(process.env.APP_PORT, process.env.UDP_HOST); // Iniciar Servidor APP
});