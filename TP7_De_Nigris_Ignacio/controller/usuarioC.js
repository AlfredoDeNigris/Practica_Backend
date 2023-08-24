require('rootpath')();
const express = require('express');
const app = express();

var usuarioDb = require("model/usuarioM.js");

app.get("/", (req, res) => { //GET
    usuarioDb.getAll((err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.post('/', (req, res) => { //POST
    let usuario = req.body;
    usuarioDb.create(usuario, (err, result) => {
        if(err){
            res.status(err.status).send(err);
        }else{
            res.json(result);
        }
    })
});

app.put('/:mail', (req, res) => { //PUT
    var mail = req.params.mail;
    var usuario = req.body;
    usuarioDb.update(mail, usuario, (err, result) => {
        if (err) {
            res.status(err.status).json(err);
        } else {
            res.json(result);
        }
    });
});

app.delete('/:mail', (req, res) => { //DELETE
    let usuario = req.params.mail;
    usuarioDb.delete(usuario, (err, result) =>{
        if(err){
            res.status(err.status).json(err);
        }else{
            res.json(result);
        }
    })
});

app.get("/:mail", (req, res) => { //GET By Email
    usuarioDb.getByEmail(req.params.mail, (err, resultado) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(resultado);
        }
    });
});


module.exports = app;
