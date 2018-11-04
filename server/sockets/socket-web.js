const { io } = require('../server');
const colors = require('colors');

const { Usuarios } = require('../classes/usuarios');
const { crearMensaje, fechaHora } = require('../utilidades/utilidades');

const usuarios = new Usuarios();

io.on('connection', (webClient) => {

    webClient.on('entrarChat', (data, callback) => {

        console.log(`Ingresó  (${fechaHora()} ):`, data);
        if (!data.nombre) {
            return callback({
                error: true,
                mensaje: 'El nombre es necesario'
            });
        }

        let personas = usuarios.agregarPersona(webClient.id, data.nombre);

        webClient.broadcast.emit('listaPersona', usuarios.getPersonas());
        //webClient.broadcast.emit('crearMensaje', crearMensaje('Administrador', `${ data.nombre } se unió`));

        callback(personas);

    });

    webClient.on('disconnect', () => {

        let personaBorrada = usuarios.borrarPersona(webClient.id);

        console.log(colors.red(`Salió    (${fechaHora()} ): { ${personaBorrada.nombre} } `));
        //webClient.broadcast.emit('crearMensaje', { usuario: 'Adminstrador', mensaje: `${ personaBorrada.nombre } abandonó el chat` });
        //webClient.broadcast.emit('crearMensaje', crearMensaje('Administrador', `${ personaBorrada.nombre } abandonó el chat`));
        webClient.broadcast.emit('listaPersona', usuarios.getPersonas());
    });

    webClient.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(webClient.id);

        webClient.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    })
});