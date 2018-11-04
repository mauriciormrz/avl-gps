//[
// {
//     vehiculo_id:     'IOR695',
//     unidad_tipo:     'eco4+',
//     unidad_imei:     '0002'
//     unidad_ip:       '10.122.42.150',
//     unidad_puerto:   '12345',
//     cliente_nombre:  'Mauricio Ramírez',
//     usuarios_web:     [{},{},{}]
// }
//]

class Vehiculos {

    constructor() {
        this.flota = [];
    }

    agregarVehiculo(vehiculo) {

        this.flota.push(vehiculo);
        return this.flota;
    }

    getVehiculo(vehiculo_id) {

        let vehiculo = this.flota.filter(vehiculo => vehiculo.vehiculo_id === vehiculo_id)[0];
        return vehiculo;
    }

    getVehiculoByIP(ip) {

        let vehiculo = this.flota.filter(vehiculo => vehiculo.unidad_ip === ip)[0];
        return vehiculo;
    }

    getVehiculoByIMEI(imei) {

        let vehiculo = this.flota.filter(vehiculo => vehiculo.unidad_imei === imei)[0];
        return vehiculo;
    }

    updateRemoteHost(imei, data) {

        for (let i in this.flota) { // Para todos los vehículos
            if (this.flota[i].unidad_imei === imei) { // Encontró el vehículo
                if (this.flota[i].unidad_ip != data.address || this.flota[i].puerto != data.port) { // El remote host del reporte es diferente al de BD
                    this.flota[i].unidad_ip = data.address;
                    this.flota[i].unidad_puerto = data.port;
                    return true; // Encontró el vehículo y cambió la ip y/o el puerto
                }
                return true; // Econtró el vehículo y NO cambió ni la ip ni el puerto
            }
        }
        return false; // No encontró el vehíulo
    }

    cargarVehiculos(vehiculos) {

        this.flota = []; // Parametro vehículos es el resultado de la consulta de los vehículos de la BD
        for (let i = 0; i < vehiculos.length; i++) {
            this.agregarVehiculo(vehiculos[i]);
        }
    }

    getVehiculos() {

        return this.flota;
    }
}

module.exports = {
    Vehiculos
}