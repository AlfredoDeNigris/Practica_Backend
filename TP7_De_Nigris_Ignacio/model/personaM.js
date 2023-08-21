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
    } catch (error) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
};

persona_db.create = function (persona, funCallback) { //POST
    try {
        const dniAsNumber = parseInt(persona.dni); //Esta es una solución parcial, ya que acepta casos como "1jge6" donde creará la persona con dni=1, en vez de rechazar el valor.
        const expectedTypes = ['number', 'string', 'string'];
        let params = [dniAsNumber, persona.nombre, persona.apellido];
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
    } catch (error) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
};

persona_db.update = function (dni, persona, funCallback) { //PUT
    try {
        const dniAsNumber = parseInt(persona.dni); //Esta es una solución parcial, ya que acepta casos como "1jge6" donde actualizará la persona con dni=1, en vez de rechazar el valor.
        const expectedTypes = ['number', 'string', 'string', 'number'];
        let params = [dniAsNumber, persona.nombre, persona.apellido, dniAsNumber];
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
    } catch (error) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
};

persona_db.delete = function (dni, funCallback) { // DELETE
    try {
        const dniAsNumber = parseInt(dni); //Esta es una solución parcial, ya que acepta casos como "1jge6" donde eliminará la persona con dni=1, en vez de rechazar el valor.
        const expectedTypes = ['number'];
        let params = [dniAsNumber];
        funcionesAuxiliares.validar(params, expectedTypes);

        let consulta = "DELETE FROM persona WHERE dni = ?";

        connection.query(consulta, params, (err, result) => {
            if (err || result.affectedRows === 0) {
                funcionesAuxiliares.errorGlobal(funCallback, err, result, "persona", "dni");
            } else {
                funCallback(undefined, {
                    mensaje: `La persona con el dni ${dniAsNumber} fue eliminada correctamente`,
                    detalle: result
                });
            }
        });
    } catch (error) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
}

persona_db.getByApellido = function (apellido, funCallback) { //GET By APELLIDO
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
    } catch (error) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
};

persona_db.getUserByNickname = function (dni, funCallback) {
    try {
        const dniAsNumber = parseInt(dni); //Esta es una solución parcial, ya que acepta casos como "1jge6" donde buscará la persona con dni=1, en vez de rechazar el valor.
        const expectedTypes = ['number'];
        let params = [dniAsNumber];
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
    } catch (error) {
        funcionesAuxiliares.errorGlobal(funCallback, err, null, "persona", "dni");
    }
};

function errorP(callback, err, result, dni) {
    if (err) {
        if (err.code === "ER_DUP_ENTRY") {
            callback({
                status: 400,
                mensaje: "Ya hay una persona registrada con ese dni",
                detail: err
            });
        } else if (err.code === "ER_ROW_IS_REFERENCED_2") {
            callback({
                status: 400,
                mensaje: "No se puede eliminar la persona, debido a que poseé una cuenta de usuario activa.",
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
    } else if ((result && result.affectedRows === 0) || (result && result.length == 0)) {
        callback({
            status: 400,
            mensaje: "No hay ninguna persona registrada con el criterio de busqueda ingresado",
            detail: err
        });
    } else if (!result[0].nickname) {
        callback({
            status: 400,
            mensaje: `La persona con el dni ${dni} no posee un usuario registrado en la base de datos.`,
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


module.exports = persona_db;