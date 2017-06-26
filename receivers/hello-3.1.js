/*!
 * RabbitMQ Publisher
 * Copyright(c) 2017 João Carlos Brandão Morgado
 * MIT Licensed
 * 
  * Consumidor que recebe mensagens da fila para processar, e imprime o que recebeu no terminal. 
 * 
 *  -> a fila monitorada é criada dinamicamente, vinculada ao exchange "hello-3-ex"
 *  -> o consumidor aceita receber mais de uma mensagem por vez
 *  -> a fila não é persistente, ou seja, caindo o serviço do RabbitMQ a fila perde todas as mensagens nela existente
 */

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {

    conn.createChannel(function(err, ch) {

        var ex = 'hello-3-ex';

        ch.assertExchange(ex, 'fanout', { durable: false });
        
        ch.assertQueue('', { exclusive: true }, function(err, q) {

            console.log(" [H3.1-C] Aguardando mensagens na fila '%s'. Para sair, use CTRL+C.", q.queue);
            ch.bindQueue(q.queue, ex, '');

            ch.consume(q.queue, function(msg) {
                console.log(" [H3.1-C] Recebida a mensagem '%s'.", msg.content.toString());
            },
            {
                noAck: true
            });

        });

    });

});