/*!
 * RabbitMQ Publisher
 * Copyright(c) 2017 João Carlos Brandão Morgado
 * MIT Licensed
 */

var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');

// Criando uma instância da framework Express
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Configurando a framework Consign para fazer o carregamento automático dos módulos
consign().include('./routes')
         .then('./receivers')
         .into(app);

module.exports = app;