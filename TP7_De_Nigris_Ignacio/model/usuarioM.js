require('rootpath')();
var usuario_db = {};

const mysql = require('mysql');
const configuracion = require("config.json");
const funcionesAuxiliares = require("../funcionesAuxiliares");

//Conexión a la base de datos.
var connection = mysql.createConnection(configuracion.database);
connection.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("La tabla 'usuario', se encuentra disponible.")
    }
});

usuario_db.getAll = function (funCallback) { //GET
    try {
        let consulta = 'SELECT * FROM usuario';
        connection.query(consulta, function (err, rows) {
            if (err) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "usuario", "mail");
            } else {
                funCallback(undefined, rows);
            }
        });
    } catch (err) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "usuario", "mail");
    }
};

usuario_db.create = function (usuario, funCallback) { //POST
    try {
        const expectedTypes = ['string', 'string', 'string', 'number'];
        let params = [usuario.mail, usuario.nickname, usuario.password, usuario.persona];
        funcionesAuxiliares.validar(params, expectedTypes);

        let consulta = 'INSERT INTO usuario (mail, nickname, password, persona) VALUES (?,?,?,?)';

        connection.query(consulta, params, (err, result) => {
            if (err) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "usuario", "mail");
            } else {
                funCallback(undefined, {
                    message: `El email ${usuario.mail}, se registró exitosamente`,
                    detail: result
                });
            }
        });
    } catch (err) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "usuario", "mail");
    }
};

usuario_db.update = function (mail, usuario, funCallback) { //PUT
    try {
        const expectedTypes = ['string', 'string', 'string', 'string', 'string', 'string']; //Aquí no me acepta el número de la persona si no es en formato "string".
        let params = [usuario.mail, usuario.nickname, usuario.password, usuario.persona, mail];
        funcionesAuxiliares.validar(params, expectedTypes);

        let consulta = 'UPDATE usuario SET mail = ?, nickname = ?, password = ?, persona = ? WHERE mail = ?';

        connection.query(consulta, params, function (err, result) {
            if (err || result.affectedRows === 0) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "usuario", "mail");
            } else {
                funCallback(undefined, {
                    message: `Se actualizó la información del usuario con el email ${usuario.mail}`,
                    detail: result
                });
            }
        });
    } catch (err) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "usuario", "mail");
    }
};

usuario_db.delete = function (mail, funCallback) { //DELETE
    try {
        const expectedTypes = ['string'];
        let params = [mail];
        funcionesAuxiliares.validar(params, expectedTypes);

        let consulta = "DELETE FROM usuario WHERE mail = ?";

        connection.query(consulta, params, (err, result) => {
            if (err || result.affectedRows === 0) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "usuario", "mail");
            } else {
                funCallback(undefined, {
                    mensaje: `Se eliminó el usuario con el email ${mail}`,
                    detail: result
                });
            }
        });
    } catch (err) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "usuario", "mail");
    }
};

usuario_db.getByEmail = function (mail, funCallback) { //GET BY EMAIL
    try {
        const expectedTypes = ['string'];
        let params = [mail];
        funcionesAuxiliares.validar(params, expectedTypes);

        let consulta = 'SELECT * FROM usuario WHERE mail = ?';

        connection.query(consulta, params, (err, result) => {
            if (err || result.length === 0) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "usuario", "mail");
            } else {
                funCallback(undefined, {
                    mensaje: `La información del email ${mail} es:`,
                    detalle: result
                });
            }
        });
    } catch (err) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "usuario", "mail");
    }
};


module.exports = usuario_db;
