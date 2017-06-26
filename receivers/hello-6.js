/*!
 * RabbitMQ Publisher
 * Copyright(c) 2017 João Carlos Brandão Morgado
 * MIT Licensed

 * Consumidor que recebe mensagens da fila para processar, e executar um procedimento remoto específico. 
 * Para este exemplo, vamos utilizar um procedimento remoto que vai calcular o fatorial de 5. 
 * 
 *  -> a fila monitorada é a "hello-6-rpc"
 *  -> a fila não é persistente, ou seja, caindo o serviço do RabbitMQ a fila perde todas as mensagens nela existente
 *  -> para tratamento do retorno da mensagem, é informado um identificador através do atributo correlationID
 *  -> a resposta é devolvida na fila que veio especificada no atributo replayTo
 */

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {

    conn.createChannel(function(err, ch) {

        var q = 'hello-6-rpc';
        ch.assertQueue(q, { durable: false });
        ch.prefetch(1);

        console.log(" [H6-C] Aguardando mensagens na fila '%s' para solicitações via RPC. Para sair, use CTRL+C.", q);

        ch.consume(q, function reply(msg) {
            var num = parseInt(msg.content.toString());
            
            console.log(' [H6-C] Calcular %d!', num);

            var r = factorial(num);

            ch.sendToQueue( 
                msg.properties.replyTo,
                new Buffer(r.toString()),
                { correlationId: msg.properties.correlationId}
            );

            ch.ack(msg);

        });

    });

});

function factorial(n) {

    if(n == 0) return 1;
    return n * factorial(n - 1);

}