const colors = require('colors');

const Iterator = require('../lib/iterator');
const Base = require('../lib/base');
const Commander = require('../lib/commander');
const Crc = require('../lib/crc');


class ruptela {


    // static getMensaje(buffer) {
    //     //set buffer iterator
    //     const bufIt = new Iterator(buffer);
    //     const bufEnd = bufIt.end;
    //     // //get base
    //     const base = new Base();
    //     if (base.fieldsLength > bufEnd) {
    //         throw new Error("Buffer size is too small");
    //     }
    //     //get base fields
    //     const fields = base.fields;
    //     //read CRC, last 2 bytes from buffer
    //     const crc = bufIt.buffer.readUIntBE(bufEnd - fields.crc, fields.crc);
    //     //slice first and last 2 bytes from buffer
    //     const tmpBuffer = bufIt.buffer.slice(fields.packet_length, -fields.crc);
    //     //compare CRC codes (read with calculated)
    //     if (crc !== Crc.calculate(tmpBuffer)) {
    //         // throw new Error("CRC is not valid");
    //     }

    //     //init data
    //     const data = {};
    //     //read packet length
    //     data.packet_length = bufIt.readNext(fields.packet_length);
    //     if (data.packet_length !== (bufEnd - fields.packet_length - fields.crc)) {
    //         //throw new Error("Packet Length is not valid");
    //     }
    //     //read IMEI
    //     data.imei = bufIt.readNext(fields.imei);
    //     //read command ID
    //     data.command_id = bufIt.readNext(fields.command_id);
    //     //execute command
    //     //const commander = new Commander(data.command_id);
    //     // commander.command.execute(bufIt);
    //     // //assign command data to payload
    //     // data.payload = commander.command.data;
    //     // //assign CRC as last field
    //     // data.crc = crc;
    //     // //return data and acknowledgement
    //     return { data };
    //     // return { data, ack: commander.command.ack };
    // }


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