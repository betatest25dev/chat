var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
app.listen(8081);


var sys = require('util');
// var io = require('socket.io').listen(8081);
var http = require('http');
var express = require("express"),
app = express(),
path = require('path');

io.set('log level', 0);

var clients = {};

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token,X-Key');

    next();
}

app.use(allowCrossDomain);

function handler (req, res) {
    fs.readFile(__dirname + '/public/index.html',
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
  
      res.writeHead(200);
      res.end(data);
    });
  }

// Simply keep a list of clients as they join, and rebroadcast submitted data
// from the client to them.
io.sockets.on('connection', function (socket) {
    sys.debug('Connected ' + socket.id);
    clients[socket.id] = socket;

    socket.on('info', function(msg) {
        sys.debug(socket.id + ': ' + msg);
    });

    socket.on('data', function(data) {
        console.log('Received data of size: ' + data.length);
        socket.broadcast.emit('update', data);
    });

    socket.on('close', function() {
        sys.debug('Disconnected ' + socket.id);
        delete clients[socket.id];
    });
});
