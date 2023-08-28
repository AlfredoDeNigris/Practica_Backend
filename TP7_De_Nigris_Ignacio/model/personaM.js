require('rootpath')();
var persona_db = {};

const mysql = require('mysql');
const configuracion = require("config.json");
const funcionesAuxiliares = require("../funcionesAuxiliares");

//Conexión a la base de datos.
var connection = mysql.createConnection(configuracion.database);
connection.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("La tabla 'persona', se encuentra disponible.")
    }
});

persona_db.getAll = function (funCallback) { //GET
    try {
        let consulta = 'SELECT * FROM persona';
        connection.query(consulta, function (err, rows) {
            if (err) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "persona", "dni");
            } else {
                funCallback(undefined, rows);
            }
        });
    } catch (err) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
};

persona_db.create = function (persona, funCallback) { //POST
    try {
        const expectedTypes = ['number', 'string', 'string'];
        let params = [persona.dni, persona.nombre, persona.apellido];
        funcionesAuxiliares.validar(params, expectedTypes);

        let consulta = 'INSERT INTO persona (dni, nombre, apellido) VALUES (?,?,?)';

        connection.query(consulta, params, (err, result) => {
            if (err) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "persona", "dni");
            } else {
                funCallback(undefined, {
                    message: `Se creó la persona ${persona.apellido} ${persona.nombre}`,
                    detail: result
                });
            }
        });
    } catch (err) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
};

persona_db.update = function (dni, persona, funCallback) { //PUT
    try {
        const expectedTypes = ['number', 'string', 'string', 'number'];
        let params = [persona.dni, persona.nombre, persona.apellido, dni];
        funcionesAuxiliares.validar(params, expectedTypes);

        let consulta = 'UPDATE persona SET dni = ?, nombre = ?, apellido = ? WHERE dni = ?';

        connection.query(consulta, params, function (err, result) {
            if (err || result.affectedRows == 0) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "persona", "dni");
            } else {
                funCallback(undefined, {
                    message: `Se actualizó la persona ${persona.apellido} ${persona.nombre}`,
                    detail: result
                });
            }
        });
    } catch (err) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
};

persona_db.delete = function (dni, funCallback) { // DELETE
    try {
        const expectedTypes = ['number'];
        let params = [dni];
        funcionesAuxiliares.validar(params, expectedTypes);

        let consulta = "DELETE FROM persona WHERE dni = ?";

        connection.query(consulta, params, (err, result) => {
            if (err || result.affectedRows === 0) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "persona", "dni");
            } else {
                funCallback(undefined, {
                    mensaje: `La persona con el dni ${dni} fue eliminada correctamente`,
                    detalle: result
                });
            }
        });
    } catch (err) {
        console.log("Entró al catch");
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
};

persona_db.getByApellido = function (apellido, funCallback) { //GET By Apellido
    try {
        const expectedTypes = ['string'];
        let params = [apellido];
        funcionesAuxiliares.validar(params, expectedTypes);

        let consulta = 'SELECT * FROM persona WHERE apellido = ?';

        connection.query(consulta, params, (err, result) => {
            if (err || result.length == 0) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "persona", "dni");
            } else {
                funCallback(undefined, {
                    mensaje: `Hay un total de ${result.length} personas con el apellido ${apellido}.`,
                    detalle: result
                });
            }
        });
    } catch (err) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
};

persona_db.getUserByNickname = function (dni, funCallback) { //GET By Nickname
    try {
        const expectedTypes = ['number'];
        let params = [dni];
        funcionesAuxiliares.validar(params, expectedTypes);

        let consulta = `SELECT p.*, u.nickname FROM persona p LEFT JOIN usuario u ON p.dni = u.persona WHERE p.dni = ?`;

        connection.query(consulta, params, (err, result) => {
            if (err || result.length == 0 || !result[0].nickname) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "persona", "dni");
            } else {
                funCallback(undefined, {
                    mensaje: `El nickname de la persona seleccionada es ${result[0].nickname}.`,
                    detalle: result
                });
            }
        });
    } catch (err) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
};


module.exports = persona_db;
