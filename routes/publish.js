/*!
 * RabbitMQ Publisher
 * Copyright(c) 2017 João Carlos Brandão Morgado
 * MIT Licensed
 * 
 * Atenção: 
 * --------
 * 
 * Os exemplos abaixo utilizam o método GET, usado apenas para simplificar a demonstração de uma requisição 
 * HTTP que coloca uma msg na fila, e apresenta o resultado obtido do processamento direto no terminal. 
 * 
 * Em seu projeto, caso pretenda obter dados externos de forma dinâmica, e incluí-los na mensagem que será 
 * posta na fila para processamento, o mais adequado é utilizar o método POST. 
 * 
 * A conexão ao RabbitMQ está sendo feita através de usuário/senha default:
 *  -> usuário: guest
 *  -> senha: guest
 */

var amqp = require('amqplib/callback_api');

module.exports = function(app) {

    /**
     * Produtor que envia uma única mensagem para uma fila, para que o consumidor dela, 
     * pegue a msg e imprima o que recebeu no terminal. 
     * 
     * Esta mensagem não persiste na fila, ou seja, se por algum motivo o RabbitMQ cair, 
     * as mensagens que ainda não foram processadas serão perdidas.
     * 
     * A msg posta na fila é:
     *  -> uma String "Hello World 1!"
     *  -> será posta na fila "hello-1-q"
     *  -> a mensagem não será persistente, ou seja, caindo o serviço do RabbitMQ ela se perde
     *  -> para ser tratada pelo consumidor "../receivers/hello-1.js"
     */
    app.get('/hello-1', function(req, res, next) {

        amqp.connect('amqp://localhost', function(err, conn) {

            conn.createChannel(function(err, ch) {
                var q = 'hello-1-q';
                var msg = "Hello World 1!"; 
                ch.assertQueue(q, { durable: false });

                ch.sendToQueue(q, new Buffer(msg));
                 console.log(" [H1-P] A msg '%s' foi enviada para a fila '%s'.", msg, q);  
            });

            setTimeout(function() {
                conn.close();
                res.json(' [H1-P] Mensagem Enviada.');
            }, 500);

        });

    });


    /**
     * Produtor que envia uma única mensagem para uma fila, para que o consumidor dela, 
     * pegue a msg e imprima o que recebeu no terminal. 
     * 
     * A msg posta na fila é:
     *  -> uma String "Hello World 2!"
     *  -> será posta na fila "hello-2-q"
     *  -> a mensagem sera persistentes, ou seja, caindo o serviço do RabbitMQ ela não se perde
     *  -> para ser tratada pelo consumidor "../receivers/hello-2.js"
     */
    app.get('/hello-2', function(req, res, next) {

        amqp.connect('amqp://localhost', function(err, conn) {

            conn.createChannel(function(err, ch) {
                var q = 'hello-2-q';
                var msg = "Hello World 2!";                                 
                ch.assertQueue(q, { durable: true });                       

                ch.sendToQueue(q, new Buffer(msg), { persistent: true })    
                console.log(" [H2-P] A msg '%s' foi enviada para a fila '%s'.", msg, q);  
            });

            setTimeout(function() {
                conn.close();
                res.json(' [H2-P] Mensagem Enviada.');
            }, 500);

        });

    });

    /**
     * Produtor que envia uma única mensagem para um exchange, para que ele faça a distribuição
     * da mesma msg para as filas nele conectado, e posteriormente, a entregue para os seus 
     * consumidores pegar a msg e imprimir o que recebeu no terminal. 
     * 
     * A msg posta na fila é:
     *  -> uma String "Hello World 3!"
     *  -> será posta no exchange "hello-3-ex"
     *  -> o exchange será configurado para distrubuir a mesma mensagem para todas as filas
     *  -> as filas serão criadas e conectadas ao exchange dinamicamente pelos consumidores
     *  -> a mensagem não será persistente, ou seja, caindo o serviço do RabbitMQ ela se perde
     *  -> a mensagem serão tratadas pelos consumidores "../receivers/hello-3.1.js" e "../receivers/hello-3.2.js"
     */
    app.get('/hello-3', function(req, res, next) {

        amqp.connect('amqp://localhost', function(err, conn) {

            conn.createChannel(function(err, ch) {
                var ex = "hello-3-ex";
                var msg = "Hello World 3!";
                ch.assertExchange(ex, 'fanout', { durable: false });

                ch.publish(ex, '', new Buffer(msg));
                console.log(" [H3-P] A msg '%s' foi enviada para o exchange '%s'.", msg, ex);  
            });

            setTimeout(function() {
               conn.close();
               res.json(' [H3-P] Mensagem Enviada.');
            }, 500);

        });

    });

    /**
     * Produtor que envia três mensagens para um exchange, para que ele faça a distribuição
     * destas mensagnes para as filas corretas, e posteriormente, a entregue para os seus 
     * consumidores pegar a msg e imprimir o que recebeu no terminal.
     * 
     * A msg posta na fila é:
     *  -> três Strings serão enviadas "Hello World 4 (1)!", "Hello World 4 (2)!" e "Hello World 4 (3)!"
     *  -> será posta no exchange "hello-4-ex"
     *  -> cada mensagem tem uma tipagem definida pelo atributo routingKey, utilizado para roteamento das filas
     *  -> o exchange será configurado para distrubuir cada mensagem para sua fila correspondente
     *  -> as filas serão criadas e conectadas ao exchange dinamicamente pelos consumidores
     *  -> as mensagens não serão persistentes, ou seja, caindo o serviço do RabbitMQ elas se perdem
     *  -> as mensagens serão tratadas pelos consumidores "../receivers/hello-4.1.js" e "../receivers/hello-4.2.js"
     */
    app.get('/hello-4', function(req, res, next) {

        amqp.connect('amqp://localhost', function(err, conn) {

            conn.createChannel(function(err, ch) {
                var ex = "hello-4-ex";
                ch.assertExchange(ex, 'direct', { durable: false });

                var msg_1 = "Hello World 4 (1)!";
                var routingKey_1 = "hello-4-rk-1";
                ch.publish(ex, routingKey_1, new Buffer(msg_1));
                console.log(" [H4-P] A msg '%s' foi enviada para o exchange '%s' com routingKey = '%s'", msg_1, ex, routingKey_1);

                var msg_2 = "Hello World 4 (2)!";
                var routingKey_2 = "hello-4-rk-2";
                ch.publish(ex, routingKey_2, new Buffer(msg_2));
                console.log(" [H4-P] A msg '%s' foi enviada para o exchange '%s' com routingKey = '%s'", msg_2, ex, routingKey_2);

                var msg_3 = "Hello World 4 (3)!";
                var routingKey_3 = "hello-4-rk-3";
                ch.publish(ex, routingKey_3, new Buffer(msg_3));
                console.log(" [H4-P] A msg '%s' foi enviada para o exchange '%s' com routingKey = '%s'", msg_3, ex, routingKey_3);
                
            });

            setTimeout(function() {
               conn.close();
               res.json(' [H4-P] Mensagem Enviada.');
            }, 500);

        });

    });

    /**
     * Produtor que envia três mensagens para um exchange, para que ele faça a distribuição
     * destas mensagnes para as filas corretas, e posteriormente, a entregue para os seus 
     * consumidores pegar a msg e imprimir o que recebeu no terminal.
     * 
     * A msg posta na fila é:
     *  -> três Strings serão enviadas "Hello World 5 (1)!", "Hello World 5 (2)!" e "Hello World 5 (3)!"
     *  -> será posta no exchange "hello-5-ex"
     *  -> cada mensagem tem uma tipagem definida pelo atributo routingKey, utilizado para roteamento das filas, agora com base em temas
     *  -> o exchange será configurado para distrubuir cada mensagem para sua fila correspondente
     *  -> as filas serão criadas e conectadas ao exchange dinamicamente pelos consumidores
     *  -> as mensagens não serão persistentes, ou seja, caindo o serviço do RabbitMQ elas se perdem
     *  -> as mensagens serão tratadas pelos consumidores "../receivers/hello-5.1.js", "../receivers/hello-5.2.js" e "../receivers/hello-5.3.js"
     */
    app.get('/hello-5', function(req, res, next) {

        amqp.connect('amqp://localhost', function(err, conn) {

            conn.createChannel(function(err, ch) {

                var ex = "hello-5-ex";
                ch.assertExchange(ex, 'topic', { durable: false });

                var msg_1 = "Hello World 5 (1)!";
                var routingKey_1 = "hello5.high-priority";
                ch.publish(ex, routingKey_1, new Buffer(msg_1));
                console.log(" [H5-P] A msg '%s' foi enviada para o exchange '%s' com routingKey = '%s'", msg_1, ex, routingKey_1);

                var msg_2 = "Hello World 5 (2)!";
                var routingKey_2 = "hello5.medium-priority";
                ch.publish(ex, routingKey_2, new Buffer(msg_2));
                console.log(" [H5-P] A msg '%s' foi enviada para o exchange '%s' com routingKey = '%s'", msg_2, ex, routingKey_2);

                var msg_3 = "Hello World 5 (3)!";
                var routingKey_3 = "hello5.low-priority";
                ch.publish(ex, routingKey_3, new Buffer(msg_3));
                console.log(" [H5-P] A msg '%s' foi enviada para o exchange '%s' com routingKey = '%s'", msg_3, ex, routingKey_3);
                
            });

            setTimeout(function() {
               conn.close();
               res.json(' [H5-P] Mensagem Enviada.');
            }, 500);

        });
    });

    /**
     * Produtor que envia uma mensagem para uma fila para executar um procedimento remoto específico. 
     * Uma resposta é retornada ao cliente, que neste caso é o consumidor da mensagem de retorno que será
     * devolvida em outra fila. 
     * 
     * Para este exemplo, vamos utilizar um procedimento remoto que vai calcular o fatorial de 5. 
     * 
     * A msg posta na fila é:
     *  -> um pedido de cálculo de 5! é solicitado
     *  -> será posta a mensagem na fila "hello-6-rpc"
     *  -> para tratamento do retorno da mensagem, é informado um identificador através do atributo correlationID, e qual é o nome da fila que a resposta deve ser dada
     *  -> o retorno fica sendo aguardado através de uma fila que será criada dinamicamente
     *  -> as mensagens serão tratadas pelos consumidores "../receivers/hello-6.js"
     */
    app.get('/hello-6', function(req, res, next) {

        amqp.connect('amqp://localhost', function(err, conn) {

            conn.createChannel(function(err, ch) {

                ch.assertQueue('', { exclusive: true }, function(err, q) {
                    var crrID = generateCrrID();
                    var num = 5;

                    console.log(' [H6-P] Foi solicitado o cálculo de %d!', num);

                    ch.consume(q.queue, function(msg) {
                        if(msg.properties.correlationId == crrID) {
                            console.log(' [H6-C] O resultado obtido de %d! é %s', num , msg.content.toString());

                            setTimeout(function() {
                                conn.close();
                                res.json(' [H6-P] Mensagem Enviada.');
                            }, 500);
                        }
                    }, 
                    {
                        noAck: true
                    });

                    ch.sendToQueue('hello-6-rpc', 
                                    new Buffer(num.toString()),
                                    { 
                                        correlationId:  crrID, 
                                        replyTo: q.queue 
                                    }
                    );

                });

            });

        });

        function generateCrrID() {
            return  Math.random.toString() + 
                    Math.random.toString() +
                    Math.random.toString();
        }

    });

};