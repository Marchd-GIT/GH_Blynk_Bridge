const config = (require('read-appsettings-json').AppConfiguration).json;
const log4js = require('log4js');
let logger = log4js.getLogger("MAIN");
logger.level = "trace";

const net = require('net');
const WebSocket = require('ws');
const http = require("http");

const tcp_handler = require('./tcp_handler');
const http_handler = require('./http_handler');
const ws_handler = require('./ws_handler');

//TCP
const tcp_server = net.createServer(tcp_handler.onClientTCP);
tcp_server.listen(config.blynk.tcp_port, config.blynk.tcp_host,(err)=>{
    if(err)logger.info(err)
    logger.info('TCP Сервер запущен на '+config.blynk.tcp_host+":"+config.blynk.tcp_port);
});

//HTTP
const http_server = http.createServer(http_handler.onConnectHTTP);
http_server.listen(config.gh.http_port, config.gh.http_host, (err) => {
    if(err){ logger.info(err)}
    logger.info('HTTP Сервер запущен на '+config.gh.http_host+":"+config.gh.http_port);
});

//WebSockets
let ws_server = new WebSocket.Server({server: http_server});
ws_server.broadcast = function (data) {
    ws_server.clients.forEach(function (client) {
        client.send(data)
    })
}
ws_server.on('connection', (Client)=>{ws_handler.onConnectWS(Client,ws_server)});