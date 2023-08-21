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
    } catch (error) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "usuario", "mail");
    }
};

usuario_db.create = function (usuario, funCallback) { //POST
    try {
        const usuarioAsNumber = parseInt(usuario.persona); //Esta es una solución parcial, ya que acepta casos como "1jge6" donde creará la persona con dni=1, en vez de rechazar el valor.
        const expectedTypes = ['string', 'string', 'string', 'number'];
        let params = [usuario.mail, usuario.nickname, usuario.password, usuarioAsNumber];
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "usuario", "mail");
    }
};

function errorU(callback, err, result) {
    console.log("Error object:", err);
    if (err) {
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            callback({
                status: 400,
                mensaje: "El dni ingresado no corresponde a ninguna persona en la base de datos",
                detail: err
            });
        } else if (err.code === "ER_DUP_ENTRY" && err.sqlMessage.includes("PRIMARY")) {
            callback({
                status: 400,
                mensaje: "El mail ingresado ya esta en uso",
                detail: err
            });
        } else if (err.code === "ER_DUP_ENTRY" && err.sqlMessage.includes("unique_persona")) {
            callback({
                status: 400,
                mensaje: "La persona seleccionada ya dispone de un usuario",
                detail: err
            });
        } else if ((err.code === "INVALID_DATA_TYPE") || (err.code === "ER_BAD_FIELD_ERROR")) {
            callback({
                status: 400,
                mensaje: "El tipo de dato ingresado no es correcto",
                detail: err
            });
        } else {
            callback({
                status: 500,
                mensaje: "Error desconocido 1",
                detail: err
            });
        }
    } else if ((result && result.affectedRows === 0) || (result && result.length === 0)) {
        callback({
            status: 400,
            mensaje: "No hay ningun usuario registrado con el criterio de busqueda ingresado",
            detail: err
        });
    } else {
        callback({
            status: 500,
            mensaje: "Error desconocido 2",
            detail: err
        });
    }
}


module.exports = usuario_db;