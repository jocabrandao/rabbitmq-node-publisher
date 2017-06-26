/*!
 * RabbitMQ Publisher
 * Copyright(c) 2017 João Carlos Brandão Morgado
 * MIT Licensed
 * 
 * Consumidor que recebe mensagens da fila para processar, e imprime o que recebeu no terminal. 
 * 
 *  -> a fila monitorada é a "hello-1-q"
 *  -> o consumidor aceita receber mais de uma mensagem por vez
 *  -> a fila não é persistente, ou seja, caindo o serviço do RabbitMQ a fila perde todas as mensagens nela existente
 */

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {

    conn.createChannel(function(err, ch) {

        var q = 'hello-1-q';
        ch.assertQueue(q, { durable: false });

        console.log(" [H1-C] Aguardando mensagens na fila '%s'. Para sair, use CTRL+C", q);

        ch.consume(q, function(msg) {
                console.log(" [H1-C] Recebida a mensagem '%s'.", msg.content.toString());
            }, 
            { 
                noAck: true 
            }
        );

    });

});