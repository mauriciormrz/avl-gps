const dateFormat = require('dateformat');
const colors = require('colors');

const crearMensaje = (nombre, mensaje) => {
    return {
        nombre,
        mensaje,
        fecha: new Date().getTime()
    };
}

const fechaHora = () => {
    return dateFormat(new Date(), "dd-mm-yyyy hh:MM:ss tt");
}


const duracionMlsgs = (txt, inicio) => {

    let fin = new Date();
    let duracion = fin.getTime() - inicio.getTime();
    return `${txt}: ${duracion} milisegundos`;
    //console.log(colors.green(`${txt}: ${duracion} milisegundos`));
}

module.exports = {
    crearMensaje,
    fechaHora,
    duracionMlsgs
}