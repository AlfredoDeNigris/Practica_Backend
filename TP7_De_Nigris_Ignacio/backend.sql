CREATE SCHEMA backend;
USE backend;

CREATE TABLE persona (
    dni INT PRIMARY KEY,
    nombre VARCHAR(30),
    apellido VARCHAR(30)
);

CREATE TABLE usuario (
    mail VARCHAR(40) PRIMARY KEY,
    nickname VARCHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL,
    persona INT NOT NULL,
    FOREIGN KEY (persona) REFERENCES persona(dni),
    CONSTRAINT unique_persona UNIQUE (persona) -- Apliqué esta modificación para ayudarme a controlar los casos muy especificos.
);
