# rabbitmq-node-publisher

Aplicação de referência, cujo objetivo é exemplificar de forma simples como utilizar o RabbitMQ integrado com o NodeJS, através de requisições HTTP. 

## Início

As instruções abaixo vão instruir você a baixar uma cópia do projeto para sua máquina local, instalar o ambiente necessário para execução e executá-lo.

Importante ressaltar que este código trata-se de um exemplo com fins instrutívos, e não para ser posto em ambiente de produção sem as devidas adequações de segurança.

### Pré-requisitos

Estamos o RabbitMQ no Docker, para tanto, é necessário que você tenha o Docker Community Edition instalado na sua máquina. Portanto, caso ainda não o tenha instalado, siga os passos descritos <a href="https://docs.docker.com/engine/installation/">aqui</a> para instalá-lo.

Depois de instalado o Docker, você vai precisar baixar a imagem oficial do RabbitMQ, para isso faça:

```
docker pull rabbitmq
```

### Instalação

A aplicação de referência precisa do NodeJS para executar. Portanto, caso ainda não o tenha instalado, siga os passos descritos <a href="https://nodejs.org/en/download/package-manager/">aqui</a> para instalá-lo.

Se quiser checar a instalação, verifique a versão instalada assim:

```
$ node -v
```

Agora que já tem o mínimo necessário para executar a aplicação, vamos clonar o repositório para seu diretório local, então faça:

```
$ git clone git@github.com:jocabrandao/rabbitmq-node-publisher.git
```
O passo acima vai criar no seu diretório escolhido a estrutura do projeto como demonstrado a seguir:

```
rabbitmq-node-publisher
|_ node_modules
|_ receivers
|___ hello-1.js
|___ hello-2.js
|___ hello-3.1.js
|___ hello-3.2.js
|___ hello-4.1.js
|___ hello-4.2.js
|___ hello-5.1.js
|___ hello-5.2.js
|___ hello-5.3.js
|___ hello-6.js
|_ routers
|___ publisher.js
|_ app.js
|_ package.json
|_ server.js
|_ README.md
```

Onde:
 - routers: são os publicadores de mensagens nas filas, acionados através de requisições http.
 - receivers: são os consumidores de fila que ficam aguardando uma mensagem para ser tratada.


Após baixar o projeto, entre no diretório criado (rabbitmq-node-publisher), e execute o comando abaixo para que as dependências sejam atualizadas.

```
$ npm install
```

Ok, estamos prontos para executar o projeto!

## Executando o container do RabbitMQ

```
$ docker run -d --hostname rabbitMQ -p 8080:15672 -p 5672:5672 rabbitmq:3-management
```
Desta forma, estamos dizendo ao RabbitMQ que ele deverá ser executado e aguardar requisições na porta 8080 para administração e 5672 para recepção de mensagens nas filas e processamento.

Para acessar o painel de administração, em seu browser, execute:

```
http://localhost:8080
```
Usuário: guest
Senha: guest


### Executando o projeto

Antes, para facilitar nossa vida, vamos instalar um pacote chamado Nodemon, ele é umrecurso interessante que monitora os arquivos do diretório, e caso haja alguma mudança neles, o serviço NodeJs é automaticamente reiniciado para nós. 

Então, dentro do diretório do projeto, faça:

```
$ npm install --save nodemon
```

Agora sim, para executar o projeto, faça:

```
$ nodemon app.js
```

### Executando o teste

Observe que ao subir o projeto, os consumidores também serão iniciados automaticamente e ficam aguardando alguma mensagem para ser processada. Então, vamos lá!

Exemplos:

## Hello-1

Produtor que envia uma única mensagem para uma fila, para que o consumidor dela, pegue a msg e imprima o que recebeu no terminal. 

Esta mensagem não persiste na fila, ou seja, se por algum motivo o RabbitMQ cair, as mensagens que ainda não foram processadas serão perdidas.

A msg posta na fila é:
 - uma String "Hello World 1!"
 - será posta na fila "hello-1-q"
 - a mensagem não será persistente, ou seja, caindo o serviço do RabbitMQ ela se perde
 - para ser tratada pelo consumidor "../receivers/hello-1.js"

Em seu browser, execute:

```
http://localhost:3000/hello-1
```

Observer no terminal o resultado obtido será:

```
 [H1-P] A msg 'Hello World 1!' foi enviada para a fila 'hello-1-q'.
 [H1-C] Recebida a mensagem 'Hello World 1!'.
```

## Hello-2

Produtor que envia uma única mensagem para uma fila, para que o consumidor dela, pegue a msg e imprima o que recebeu no terminal. 

A msg posta na fila é:
 - uma String "Hello World 2!"
 - será posta na fila "hello-2-q"
 - a mensagem sera persistentes, ou seja, caindo o serviço do RabbitMQ ela não se perde
 - para ser tratada pelo consumidor "../receivers/hello-2.js"

Em seu browser, execute:

```
http://localhost:3000/hello-2
```

Observer no terminal o resultado obtido será:

```
 [H2-P] A msg 'Hello World 2!' foi enviada para a fila 'hello-2-q'.
 [H2-C] Recebida a mensagem 'Hello World 2!'.
 [H2-C] ACK enviado.
```

## Hello-3

Produtor que envia uma única mensagem para um exchange, para que ele faça a distribuição da mesma msg para as filas nele conectado, e posteriormente, a entregue para os seus consumidores pegar a msg e imprimir o que recebeu no terminal. 

A msg posta na fila é:
 - uma String "Hello World 3!"
 - será posta no exchange "hello-3-ex"
 - o exchange será configurado para distrubuir a mesma mensagem para todas as filas
 - as filas serão criadas e conectadas ao exchange dinamicamente pelos consumidores
 - a mensagem não será persistente, ou seja, caindo o serviço do RabbitMQ ela se perde
 - a mensagem serão tratadas pelos consumidores "../receivers/hello-3.1.js" e "../receivers/hello-3.2.js"

Em seu browser, execute:

```
http://localhost:3000/hello-3
```

Observer no terminal o resultado obtido será:

```
 [H3-P] A msg 'Hello World 3!' foi enviada para o exchange 'hello-3-ex'.
 [H3.2-C] Recebida a mensagem 'Hello World 3!'.
 [H3.1-C] Recebida a mensagem 'Hello World 3!'.
```

## Hello-4

Produtor que envia três mensagens para um exchange, para que ele faça a distribuição destas mensagnes para as filas corretas, e posteriormente, a entregue para os seus consumidores pegar a msg e imprimir o que recebeu no terminal.

A msg posta na fila é:
 - três Strings serão enviadas "Hello World 4 (1)!", "Hello World 4 (2)!" e "Hello World 4 (3)!"
 - será posta no exchange "hello-4-ex"
 - cada mensagem tem uma tipagem definida pelo atributo routingKey, utilizado para roteamento das filas
 - o exchange será configurado para distrubuir cada mensagem para sua fila correspondente
 - as filas serão criadas e conectadas ao exchange dinamicamente pelos consumidores
 - as mensagens não serão persistentes, ou seja, caindo o serviço do RabbitMQ elas se perdem
 - as mensagens serão tratadas pelos consumidores "../receivers/hello-4.1.js" e "../receivers/hello-4.2.js"

Em seu browser, execute:

```
http://localhost:3000/hello-4
```

Observer no terminal o resultado obtido será:

```
 [H4-P] A msg 'Hello World 4 (1)!' foi enviada para o exchange 'hello-4-ex' com routingKey = 'hello-4-rk-1'
 [H4-P] A msg 'Hello World 4 (2)!' foi enviada para o exchange 'hello-4-ex' com routingKey = 'hello-4-rk-2'
 [H4-P] A msg 'Hello World 4 (3)!' foi enviada para o exchange 'hello-4-ex' com routingKey = 'hello-4-rk-3'
 [H4.1-C] Recebida a mensagem 'Hello World 4 (1)!' com routingKey igual a 'hello-4-rk-1'.
 [H4.2-C] Recebida a mensagem 'Hello World 4 (2)!' com routingKey igual a 'hello-4-rk-2' ou 'hello-4-rk-3'.
 [H4.2-C] Recebida a mensagem 'Hello World 4 (3)!' com routingKey igual a 'hello-4-rk-2' ou 'hello-4-rk-3'.
```

## Hello-5

Produtor que envia três mensagens para um exchange, para que ele faça a distribuição destas mensagnes para as filas corretas, e posteriormente, a entregue para os seus consumidores pegar a msg e imprimir o que recebeu no terminal.

A msg posta na fila é:
 - três Strings serão enviadas "Hello World 5 (1)!", "Hello World 5 (2)!" e "Hello World 5 (3)!"
 - será posta no exchange "hello-5-ex"
 - cada mensagem tem uma tipagem definida pelo atributo routingKey, utilizado para roteamento das filas, agora com base em temas
 - o exchange será configurado para distrubuir cada mensagem para sua fila correspondente
 - as filas serão criadas e conectadas ao exchange dinamicamente pelos consumidores
 - as mensagens não serão persistentes, ou seja, caindo o serviço do RabbitMQ elas se perdem
 - as mensagens serão tratadas pelos consumidores "../receivers/hello-5.1.js", "../receivers/hello-5.2.js" e "../receivers/hello-5.3.js"

Em seu browser, execute:

```
http://localhost:3000/hello-5
```

Observer no terminal o resultado obtido será:

```
 [H5-P] A msg 'Hello World 5 (1)!' foi enviada para o exchange 'hello-5-ex' com routingKey = 'hello5.high-priority'
 [H5-P] A msg 'Hello World 5 (2)!' foi enviada para o exchange 'hello-5-ex' com routingKey = 'hello5.medium-priority'
 [H5-P] A msg 'Hello World 5 (3)!' foi enviada para o exchange 'hello-5-ex' com routingKey = 'hello5.low-priority'
 [H5.2-C] Recebida a mensagem 'Hello World 5 (2)!' com routingKey igual a '*.medium-priority' ou '*.low-priority'.
 [H5.2-C] Recebida a mensagem 'Hello World 5 (3)!' com routingKey igual a '*.medium-priority' ou '*.low-priority'.
 [H5.3-C] Recebida a mensagem 'Hello World 5 (1)!' com routingKey igual a 'hello5.*'.
 [H5.3-C] Recebida a mensagem 'Hello World 5 (2)!' com routingKey igual a 'hello5.*'.
 [H5.3-C] Recebida a mensagem 'Hello World 5 (3)!' com routingKey igual a 'hello5.*'.
 [H5.1-C] Recebida a mensagem 'Hello World 5 (1)!' com routingKey igual a '*.high-priority'.
```

## Hello-6

Produtor que envia uma mensagem para uma fila para executar um procedimento remoto específico. Uma resposta é retornada ao cliente, que neste caso é o consumidor da mensagem de retorno que será devolvida em outra fila. 

Para este exemplo, vamos utilizar um procedimento remoto que vai calcular o fatorial de 5. 

A msg posta na fila é:
 - um pedido de cálculo de 5! é solicitado
 - será posta a mensagem na fila "hello-6-rpc"
 - para tratamento do retorno da mensagem, é informado um identificador através do atributo correlationID, e qual é o nome da fila que a resposta deve ser dada
 - o retorno fica sendo aguardado através de uma fila que será criada dinamicamente
 - as mensagens serão tratadas pelos consumidores "../receivers/hello-6.js"

Em seu browser, execute:

```
http://localhost:3000/hello-6
```

Observer no terminal o resultado obtido será:

```
 [H6-P] Foi solicitado o cálculo de 5!
 [H6-C] Calcular 5!
 [H6-C] O resultado obtido de 5! é 120
```

## Construído utilizando

* [Docker](https://www.docker.com/) - Ferramenta que facilita a criação e administração de ambientes isolado.
* [RabbitMQ](https://www.rabbitmq.com/) - Ferramenta que implementa o protocolo AMQP, construído para lidar com grande tráfego de mensagens e integração entre sistemas.
* [Express](http://expressjs.com/) - A web framework utilizada.
* [NodeJS](https://nodejs.org/en/) - Plataforma construída sobre o motor JavaScript do Google Chrome para facilmente construir aplicações de rede rápidas e escaláveis. 
* [Consign](https://www.npmjs.com/package/consign) - Usado para fazer o carregamento automático dos módulos do projeto.
* [amqplib](https://www.npmjs.com/package/amqplib) - Usado para integração entre o RabbitMQ e NodeJS.

## Autor

* **João Carlos Brandão Morgado** - *Trabalho Inicial* - [joaobrandao](https://github.com/jocabrandao)

## Licença

MIT 