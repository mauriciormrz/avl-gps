const colors = require('colors');
const { duracionMlsgs } = require('../utilidades/utilidades');

//  Conexión MySQL ================================================
const { MySQL } = require('../mysql/mysql');
const DEGREE_TO_METER = 110539.952002;

class Geocod {

    constructor() {
        this.vias = [];
        console.log(colors.red('Clase Geocod inicializada'));
    }


    // Dirección de desplazamiento
    getSentido(heading) {

        if (heading >= 337.5 || heading < 22.5) {
            return 'Norte';
        } else if (heading >= 22.5 && heading < 67.5) {
            return 'Nor-Oriente';
        } else if (heading >= 67.5 && heading < 112.5) {
            return 'Oriente';
        } else if (heading >= 112.5 && heading < 157.5) {
            return 'Sur-Oriente';
        } else if (heading >= 157.5 && heading < 202.5) {
            return 'Sur';
        } else if (heading >= 202.5 && heading < 247.5) {
            return 'Sur-Occidente';
        } else if (heading >= 247.5 && heading < 292.5) {
            return 'Occidente';
        } else {
            return 'Nor-Occidente';
        }
    }

    getDistanciaDosPuntos(xi, yi, xf, yf) {

        let dist;

        dist = Math.abs(Math.sqrt((xi - xf) * (xi - xf) + (yi - yf) * (yi - yf)));
        dist = Math.abs(dist * DEGREE_TO_METER);
        return dist;
    }




    // Distancia entre dos puntos
    getDistancia(x, xi, xf, y, yi, yf) {

        let dist;

        if (xf === xi) {
            let yu = yf;
            let yd = yi;

            if (y >= yu) {
                dist = Math.abs(Math.sqrt((xi - x) * (xi - x) + (yu - y) * (yu - y)));
                dist = dist * DEGREE_TO_METER;
                return dist;
            }
            if (y <= yd) {
                dist = Math.abs(Math.sqrt((xi - x) * (xi - x) + (yd - y) * (yd - y)));
                dist = dist * DEGREE_TO_METER;
                return dist;
            }
            if ((y > yd) && (y < yu)) {
                dist = Math.abs(xi - x);
                dist = dist * DEGREE_TO_METER
                return dist;
            }
        }

        if (yf === yi) {

            let xr;
            let xl;
            if (xf > xi) {
                xr = xf;
                xl = xi;
            } else {
                xr = xi;
                xl = xf;
            }
            if (x >= xr) {
                dist = Math.abs(Math.sqrt((x - xr) * (x - xr) + (yi - y) * (yi - y)));
                dist = dist = dist * DEGREE_TO_METER;
                return dist;
            }
            if (x <= xl) {
                dist = Math.abs(Math.sqrt((x - xl) * (x - xl) + (yi - y) * (yi - y)));
                dist = dist * DEGREE_TO_METER;
                return dist;
            }
            if ((x > xl) && (x < xr)) {
                dist = Math.abs(yi - y);
                dist = dist;
                return dist = Math.abs((yi - y) * DEGREE_TO_METER);
            }
        }

        let xr = xf;
        let yr = yf;
        let xl = xi;
        let yl = yi;

        let M = (yf - yi) / (xf - xi);
        let b = yi - M * xi;
        let bp = y + (1 / M) * x;
        let xs = (bp - b) / (M + 1 / M);
        let ys = b + M * xs;

        if (xs > xr) {
            dist = Math.abs(Math.sqrt((xr - x) * (xr - x) + (yr - y) * (yr - y)));
        } else {
            if (xs < xl) {
                dist = Math.abs(Math.sqrt((xl - x) * (xl - x) + (yl - y) * (yl - y)));
            } else {
                dist = Math.abs(Math.sqrt((xs - x) * (xs - x) + (ys - y) * (ys - y)));
            }
        }
        return dist = Math.abs(dist * DEGREE_TO_METER);
    }


    getQueryVias(pos, heading, delta) {

        if (pos.velocidad >= 5) {
            return `SELECT * FROM geo_vias WHERE(x <= ${pos.longitud + delta} AND x >= ${pos.longitud - delta} AND y <= ${pos.latitud + delta} AND y >= ${pos.latitud - delta} AND sentido >= ${heading -15} AND sentido <= ${heading + 15})`;
        } else {
            return `SELECT * FROM geo_vias WHERE( x<= ${pos.longitud +delta} AND x >= ${pos.longitud - delta} AND y <= ${pos.latitud + delta} AND y >= ${pos.latitud - delta})`;
        }
    }

    getQueryRegiones(pos, delta) {

        return `SELECT * FROM geo_regiones WHERE( x<= ${pos.longitud +delta} AND x >= ${pos.longitud - delta} AND y <= ${pos.latitud + delta} AND y >= ${pos.latitud - delta})`;
    }


    getUbicacion(pos, inicio) {

        return new Promise((resolve, reject) => {

            let heading = (pos.sentido <= 180) ? 90 - pos.sentido : 270 - pos.sentido;

            pos.direccion = this.getSentido(pos.sentido);

            let queryVias = this.getQueryVias(pos, heading, 0.002);
            MySQL.ejecutarQuery(queryVias, (err, results) => {

                if (err) reject('Error geo_vias: ', err.stack);

                if (results.length === 0) { // No se encontró en la primera búsqueda de geo_vias

                    let queryVias = this.getQueryVias(pos, heading, 0.005);
                    MySQL.ejecutarQuery(queryVias, (err, results) => {

                        if (err) reject('Error geo_vias: ', err.stack); //console.log('Error geo_vias', err.stack);
                        if (results.length === 0) { // No se encontró en la segunda búsqueda de geo_vias

                            let queryRegiones = this.getQueryRegiones(pos, 0.01);
                            MySQL.ejecutarQuery(queryRegiones, (err, results) => {
                                if (err) reject('Error geo_regiones: ', err.stack); //console.log('Error geo_regiones', err.stack);
                                this.getRegion(pos, results);
                                resolve();
                            });

                        } else { // Si se encontró en la segunda búsqueda
                            this.getVia(pos, results);
                            resolve();
                        }
                    });
                } else { // Si se encontró en la primera búsqueda
                    this.getVia(pos, results);
                    resolve();
                }
            });
        });
    }

    async getVia(pos, results) {

        let i = 0;
        let distancia_corta = this.getDistancia(pos.longitud, results[i].xi, results[i].xf, pos.latitud, results[i].yi, results[i].yf);
        let distancia_actual = distancia_corta;

        pos.ubicacion = [results[i].direccion, results[i].direccion2, results[i].divpol1, results[i].divpol2, results[i].divpol3, results[i].divpol4].filter(Boolean).join("-");

        i = 1;
        while (i < results.length) {

            distancia_actual = this.getDistancia(pos.longitud, results[i].xi, results[i].xf, pos.latitud, results[i].yi, results[i].yf);
            if (distancia_actual < distancia_corta) {
                distancia_corta = distancia_actual;
                pos.ubicacion = [results[i].direccion, results[i].direccion2, results[i].divpol1, results[i].divpol2, results[i].divpol3, results[i].divpol4].filter(Boolean).join("-");
            }
            i++;
        }
        pos.distancia = Math.trunc(distancia_corta);
        return true;
    }


    async getRegion(pos, results) {

        if (results.length === 0) {
            pos.ubicacion = `${pos.longitud}, ${pos.latitud}`;
            return false;
        }

        let i = 0;
        let distancia_corta = this.getDistancia(pos.longitud, pos.longitud, results[i].x, results[i].y, pos.latitud, pos.latitud);
        let distancia_actual = distancia_corta;

        pos.ubicacion = [results[i].region, results[i].municipio, results[i].departamento].filter(Boolean).join("-");

        i = 1;
        while (i < results.length) {

            distancia_actual = this.getDistancia(pos.longitud, pos.longitud, results[i].x, results[i].y, pos.latitud, pos.latitud);
            if (distancia_actual < distancia_corta) {
                distancia_corta = distancia_actual;
                pos.ubicacion = [results[i].region, results[i].municipio, results[i].departamento].filter(Boolean).join("-");
            }
            i++;
        }
        pos.distancia = Math.trunc(distancia_corta);
        return true;
    }
} // Fin de la clase

module.exports = {
    Geocod
}