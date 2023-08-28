require('rootpath')();
const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
morgan(':method :url :status :res[content-length] - :response-time ms');

const configuracion = require("config.json");
const controlador_persona = require("controller/personaC.js");
const controlador_usuario = require("controller/usuarioC.js");

app.use('/api/persona', controlador_persona);
app.use('/api/usuario', controlador_usuario);

//Conexión al host.
app.listen(configuracion.server.port, (err) => {
    if (err) {
        console.log(err.code);
        console.log(err.fatal);
    } else {
        console.log(`Conectado exitosamente al puerto ${configuracion.server.port}.`)
    }
});
