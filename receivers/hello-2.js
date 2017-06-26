/*!
 * RabbitMQ Publisher
 * Copyright(c) 2017 João Carlos Brandão Morgado
 * MIT Licensed
 * 
 * Consumidor que recebe mensagens da fila para processar, e imprime o que recebeu no terminal. 
 * 
 *  -> a fila monitorada é a "hello-2-q"
 *  -> o consumidor só aceita receber uma mensagem por vez
 *  -> o consumidor só receberá uma nova mensagem para processar depois que enviar o ACK para a fila
 *  -> a fila é persistente, ou seja, caindo o serviço do RabbitMQ a fila não perde todas as mensagens nela existente
 */

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {

    conn.createChannel(function(err, ch) {

        var q = 'hello-2-q';

        ch.assertQueue(q, { durable: true });
        ch.prefetch(1);

        console.log(" [H2-C] Aguardando mensagens na fila '%s'. Para sair, use CTRL+C.", q);

        ch.consume(q, function(msg) {
             console.log(" [H2-C] Recebida a mensagem '%s'.", msg.content.toString());
             setTimeout(function() {
                 console.log(" [H2-C] ACK enviado.");
                 ch.ack(msg);
             }, 1000);
            }, 
            { 
                noAck: false 
            }
        );
    });

});