const colors = require('colors');

class ruptela {

    static getMensaje(msg, callback) {


        let pos = true;

        let imei = this.getIMEI(msg);

        if (!pos) {
            let ack = new Buffer(`Acknowledge`);
            callback(imei, ack, null);

        } else {
            let ack = new Buffer(`Acknowledge posición`);

            let posicion = {
                vehiculo_id: imei,
                hora_posicion: '15/10/2018 14:18:49',
                descripcion: 'Reporte por Giro',
                velocidad: 4,
                direccion: 'Sur',
                sentido: 169,
                validez: 2,
                latitud: 6.13226,
                longitud: -75.63737,
                odometro: 19956
            }
            callback(imei, ack, posicion);
        }
    }


    static parametrosInsert(reporte) {

        let insert = `
            '${reporte.vehiculo_id}',
            '${reporte.hora_posicion}',
            '${reporte.ubicacion}',
            '${reporte.descripcion}',
             ${reporte.velocidad},
            '${reporte.direccion}',
             ${reporte.sentido},
             ${reporte.validez},
             ${reporte.latitud},
             ${reporte.longitud},
             ${reporte.odometro}`;

        return (insert);
    }

    static getIMEI(msg) {
        return '0150';
    }
}

module.exports = {
    ruptela
}