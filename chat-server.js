"use strict";

var port = 8080;

var webSocketServer = require('websocket').server;
var http = require('http');

var history = [ ];
var clients = [ ];

var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum',
 'orange', 'black', 'lime', 'maroon', 'navy', 'olive', 'yellow'];



var server = http.createServer(function(request, response) {
});

server.listen(port, function() {
  console.log((new Date()) + " Servidor conectado a porta "
      + port);
});

var wsServer = new webSocketServer({
  httpServer: server
});

wsServer.on('request', function(request) {
  console.log((new Date()) + ' Conexão de '
      + request.origin + '.');

  var connection = request.accept(null, request.origin); 
  var index = clients.push(connection) - 1;
  var userName = false;
  var userColor = false;
  console.log((new Date()) + ' Conexão Aceita');

  if (history.length > 0) {
    connection.sendUTF(
        JSON.stringify({ type: 'history', data: history} ));
  }

  connection.on('message', function(message) {
     if (userName === false) {

        userName = message.utf8Data;

        userColor = colors.shift();

        connection.sendUTF(
            JSON.stringify({ type:'color', data: userColor }));
        console.log((new Date()) + ' O Nome do Usuário é: ' + userName
                    + ' e está usando: ' + userColor + ' color.');
      } else { 
        console.log((new Date()) + ' Mensagem Recebida de '
                    + userName + ': ' + message.utf8Data);
        
        var obj = {
          time: (new Date()).getTime(),
          text: message.utf8Data,
          author: userName,
          color: userColor
        };
        history.push(obj);
        history = history.slice(-100);

        var json = JSON.stringify({ type:'message', data: obj });
        for (var i=0; i < clients.length; i++) {
          clients[i].sendUTF(json);
        }
      }
  });

  connection.on('close', function(connection) {
    if (userName !== false && userColor !== false) {
      console.log((new Date()) + " user "
          + connection.remoteAddress + " disconnected");

      clients.splice(index, 1);

      colors.push(userColor);
    }
  });
});