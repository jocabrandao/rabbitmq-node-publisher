/*!
 * RabbitMQ Publisher
 * Copyright(c) 2017 João Carlos Brandão Morgado
 * MIT Licensed
 */

// Importando as configurações do servidor
var app = require('./server');

// Iniciando o servidor
app.listen(3000, function() {
    console.log("Serviço rodando com 'Express Framework' na porta 3000.");
});