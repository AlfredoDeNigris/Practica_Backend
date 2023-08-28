function validar(params, expectedTypes) {
    for (let i = 0; i < params.length; i++) {
        const expectedType = expectedTypes[i];
        const actualType = typeof params[i];

        if (expectedType === 'number') {
            const inputStr = params[i].toString();
            for (let j = 0; j < inputStr.length; j++) {
                if (isNaN(inputStr[j])) {
                    throw { code: "INVALID_DATA_TYPE" };
                }
            }
            params[i] = parseInt(params[i]);
        } else if (expectedType !== actualType) {
            throw { code: "INVALID_DATA_TYPE" };
        }
    }
};

function errorGlobal(callback, err, result, entidad, id) {
    if (err) {
        if (err.code === "ER_DUP_ENTRY" && err.sqlMessage.includes('unique_persona')) {
            callback({
                status: 409,
                mensaje: "La persona seleccionada ya dispone de un usuario",
                detail: err
            });
        }else if (err.code === "ER_DUP_ENTRY") {
                callback({
                    status: 409,
                    mensaje: `Ya hay una ${entidad} registrad@ con ese ${id}`,
                    detail: err
                });
        } else if (err.code === "ER_NO_REFERENCED_ROW_2" && entidad === "usuario") {
                callback({
                    status: 422,
                    mensaje: "El dni ingresado no corresponde a ninguna persona en la base de datos",
                    detail: err
                });
        } else if (err.code === "ER_ROW_IS_REFERENCED_2") {
            callback({
                status: 409,
                mensaje: `No se puede eliminar esta persona, debido a que poseé una cuenta de usuario activa.`,
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
                mensaje: "Error desconocido",
                detail: err
            });
        }
    } else if ((result && result.affectedRows === 0) || (result && result.length === 0)) {
        callback({
            status: 404,
            mensaje: `No existé ${entidad} registrad@ con el criterio de búsqueda ingresado`,
            detail: err
        });
    } else if (entidad === "persona" && !result[0].nickname) {
        callback({
            status: 422,
            mensaje: `La persona no posee un usuario registrado en la base de datos.`,
            detail: err
        });
    } else {
        callback({
            status: 500,
            mensaje: "Comportamiento desconocido",
            detail: err
        });
    }
};


module.exports = {
    validar: validar,
    errorGlobal: errorGlobal
};
