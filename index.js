const process = require('process');

const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = "info";

const ds = require('./state_control')
const bo = require('./bin_operation');

const WebSocket = require('ws');


const net = require('net');

var tcp_server = net.createServer(onClientTCP);
tcp_server.listen(8080, '10.30.0.16');
console.log('TCP Сервер запущен на 8080 порту');

const HubCodes = [
    'api_v',
    'id',
    'client',
    'type',
    'update',
    'updates',
    'get',
    'last',
    'crc32',
    'discover',
    'name',
    'prefix',
    'icon',
    'PIN',
    'version',
    'max_upload',
    'http_transfer',
    'ota_type',
    'ws_port',
    'modules',
    'total',
    'used',
    'code',
    'OK',
    'ack',
    'info',
    'controls',
    'ui',
    'files',
    'notice',
    'alert',
    'push',
    'script',
    'refresh',
    'print',

    'error',
    'fs_err',
    'ota_next',
    'ota_done',
    'ota_err',
    'fetch_start',
    'fetch_chunk',
    'fetch_err',
    'upload_next',
    'upload_done',
    'upload_err',
    'ota_url_err',
    'ota_url_ok',

    'value',
    'maxlen',
    'rows',
    'regex',
    'align',
    'min',
    'max',
    'step',
    'dec',
    'unit',
    'font_size',
    'action',
    'nolabel',
    'suffix',
    'notab',
    'square',
    'disable',
    'hint',
    'len',
    'wwidth',
    'wheight',
    'data',
    'wtype',
    'keep',
    'exp',

    'plugin',
    'js',
    'css',
    'ui_file',
    'stream',
    'port',
    'canvas',
    'width',
    'height',
    'active',
    'html',
    'dummy',
    'menu',
    'gauge',
    'gauge_r',
    'gauge_l',
    'led',
    'log',
    'table',
    'image',
    'text',
    'display',
    'text_f',
    'label',
    'title',
    'dpad',
    'joy',
    'flags',
    'tabs',
    'switch_t',
    'switch_i',
    'button',
    'color',
    'select',
    'spinner',
    'slider',
    'datetime',
    'date',
    'time',
    'confirm',
    'prompt',
    'area',
    'pass',
    'input',
    'hook',
    'row',
    'col',
    'space',
    'platform',
    'map',
    'latlon',
    'location',
    'high_accuracy',
    'layer',
    'udp_port',
    'container',
    'rowcol',
    'spoiler',
    'http_port',
    'tags',
];


let openSockets = [];
function onClientTCP(sock) {
    let logger = log4js.getLogger("onClientTCP");
    var remoteAddress = sock.remoteAddress + ':' + sock.remotePort;
    logger.info('new client connected: %s', remoteAddress, openSockets.length);
    let sock_num = openSockets.length
    logger.info('new client connected number: ', sock_num);
    openSockets.push({"sock": sock, "state": 0, "last_mess": "0000"});

    sock.on('data', function (data) {
        logger.info('RECEIVED <', sock.remoteAddress, bo.decodeCommand(data) ,data.toString('hex') );
        let mess;
        let new_id;
        let decode_data = decodeBlynkMessHw(data.toString('hex'))
        //logger.info(decode_data);
        switch (bo.decodeCommand(data)) {

            case 'BLYNK_CMD_GET_SHARED_DASH':
                //Запускаем обмен данными
                //TODO тут добавить проверку токена если будет необходимо
                //BLYNK_CMD_RESPONSE
                new_id = bo.incrementHexNumber(openSockets[sock_num].last_mess)
                mess = '00' + new_id + '00c8'
                openSockets[sock_num]["last_mess"] = new_id;
                logger.info("SEND MESS>", sock.remoteAddress, "BLYNK_CMD_GET_SHARED_DASH", mess)
                logger.trace("--- ",JSON.stringify(decodeBlynkMessHw(mess.toString('hex'))));
                logger.info("TOKEN: ",decode_data.message)
                openSockets[sock_num]["token"] = decode_data.message;
                sock.write(Buffer.from(mess, 'hex'));
                break
            case 'BLYNK_CMD_INTERNAL':
                //BLYNK_CMD_RESPONSE
                new_id = bo.incrementHexNumber(openSockets[sock_num].last_mess)
                mess = '00' + new_id + '00c8'
                openSockets[sock_num]["last_mess"] = new_id;
                logger.info("SEND MESS>", sock.remoteAddress, "BLYNK_CMD_INTERNAL", mess)
                logger.trace("--- ",JSON.stringify(decodeBlynkMessHw(mess.toString('hex'))) );
                sock.write(Buffer.from(mess, 'hex'));
                break
            case 'BLYNK_CMD_HARDWARE_SYNC':
                new_id = bo.incrementHexNumber(openSockets[sock_num].last_mess)
                mess = ''
                findObjectsWithIds(ds.deviceList,[],'token', openSockets[sock_num]["token"]).forEach((C)=>{
                    logger.info("GEN PARAMS: ",C.pin_t, C.pin+"", "write", C.value + "", new_id)
                    mess += genBlynkMessage(C.pin_t, C.pin+"", "write", C.value + "", new_id)
                })
                logger.info("NEW SYNC MESS: ",mess)
                //mess = '11' + new_id + '000976770032003130323414000300067677003100301400030008767700340032353514000300087677003800323032140003000876770036003235351400030009767700313000323535'
                //mess = genBlynkMessage("virtual", "1", "write", "1", new_id)
                openSockets[sock_num]["last_mess"] = new_id;
                logger.info("SEND MESS>", sock.remoteAddress, "BLYNK_CMD_HARDWARE_SYNC", mess)
                logger.trace("--- ",JSON.stringify(decodeBlynkMessHw(mess.toString('hex'))));
                sock.write(Buffer.from(mess, 'hex'));
                break
            case 'BLYNK_CMD_PING':
                //BLYNK_CMD_RESPONSE
                new_id = bo.incrementHexNumber(openSockets[sock_num].last_mess)
                mess = '00' + new_id + '00c8'
                openSockets[sock_num]["last_mess"] = new_id;
                logger.info("SEND MESS>", sock.remoteAddress, "BLYNK_CMD_PING", mess)
                logger.trace("--- ",JSON.stringify(decodeBlynkMessHw(mess.toString('hex'))));
                sock.write(Buffer.from(mess, 'hex'));
                break
            default:
                break
        }
        //logger.info(openSockets)
    });
    sock.on('close', function () {
        logger.info('connection from %s closed', remoteAddress);
    });
    sock.on('timeout', function () {
        logger.info('timeout', remoteAddress);
    });
    sock.on('error', function (err) {
        logger.info('Connection %s error: %s', remoteAddress, err.message);
    });
};

const ws_server = new WebSocket.Server({port: 8082});
ws_server.broadcast = function (data) {
    ws_server.clients.forEach(function (client) {
        client.send(data)
    })
}
console.log('WS Сервер запущен на 8082 порту');
ws_server.on('connection', onConnectWS);
function onConnectWS(wsClient) {
    console.log('new ws client');
    //wsClient.send('#{#1:"100000",#3:#17}#');

    wsClient.on('close', function () {
        console.log('client disconnected');
    });

    wsClient.on('message', function (message) {
        let widget = message.toString().split('/')[4]
        let id = message.toString().split("/")[1]
            console.log(message.toString());
        try {
            switch (true) {
                case /.*\/.*\/.*\/set\/.*/.test(message):
                    mgmt( widget,id )
                    wsClient.send('#{#1:"'+id+'",#3:#17}#');
                    wsClient.send('#{#1:"'+id+'",#3:#18,#a:"'+widget.split('=')[0]+'"}#');
                    ws_server.broadcast('#{#1:"'+id+'",#3:#4,#5:{"'+widget.split('=')[0]+'":{#30:"'+widget.split('=')[1]+'"}}}#');
                    break;
                case /.*\/.*\/.*\/ping/.test(message):
                    wsClient.send('#{#1:"'+id+'",#3:#17}#');
                    break;
                case /.*\/.*\/.*\/unix/.test(message):
                    wsClient.send('#{#1:"'+id+'",#3:#17}#');
                    break;
                case /.*\/.*\/.*\/ui/.test(message):
                    console.log("HG DEVICE ID HTTP: ",id)
                    ds.deviceList.devices.forEach((D)=>{
                        if (D.device.id === id) {
                            wsClient.send(encodeHubJson(D.ui))
                        }
                    })
                    break;
                default:
                    console.log('Неизвестная команда');
                    break;
            }
        } catch (error) {
            console.log('Ошибка', error);
        }
    });
}

const http = require("http");
const {genBlynkMessage, decodeBlynkMessHw} = require("./bin_operation");
const onConnectHTTP = async function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Private-Network", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    let id = req.url.split("/")[3]
    let prefix = req.url.split("/")[2]
    switch (true) {
        case /\/hub\/.*\/.*\/.*\/ui/.test(req.url):
            res.writeHead(200);
            ds.deviceList.devices.forEach((D)=>{
                if (D.device.id === id) {
                    res.end(encodeHubJson(D.device));
               }
            })
            break;
        case /\/hub\/.*/.test(req.url):
            console.log("prefix",prefix)
            console.log("ds.deviceList",ds.deviceList);
            let ui = findObjectsWithIds(ds.deviceList,[],"prefix", prefix)[0]
            res.writeHead(200);
            res.end(encodeHubJson(ui))
            break;
        default:
            res.writeHead(200);
            res.end(JSON.stringify({error: "Command not found, return 200 ok"}));
    }
};
const server = http.createServer(onConnectHTTP);
server.listen(8081, "10.30.0.16", () => {
});


console.log('HTTP Сервер запущен на 8081 порту');
function encodeHubJson(data) {
    if (!data || typeof data !== 'object') return null;
    let encodedData = JSON.stringify(data);
    for (let i = 0; i < HubCodes.length; i++) {
        const re = new RegExp(`"(\\b${HubCodes[i]}\\b)"(?=\\s*:|\\s*,|\\s*\\})`, "g");
        encodedData = encodedData.replace(re, `#${i.toString(16)}`);
    }
    encodedData = encodedData.replace(/"#(\w+)"/g, "#$1");
    return `#${encodedData}#`;
}

function mgmt(set,id) {
    let mess;
    let new_id;
    let widget = set.split('=')[0]
    let value = set.split('=')[1]
    let controllers = findObjectsWithIds(ds.deviceList,[],'id',id) // ищем устройство с нужным id
    let controller = findObjectsWithIds(controllers,[],'id',widget)[0] // ищем в устройстве нужный контроллер
    let index = controller.path.shift() // сдвигаем массив на один элемент влево, запоминаем элемент
    controller.path = controllers[index].path.concat(controller.path) // находим полный путь к контроллеру
    controller.path.push("value")
    openSockets.forEach((e, i) => {
        console.log("IF:  ",openSockets[i]["token"],controller.token)
        if(openSockets[i]["token"] === controller.token){
            //console.log("MGMT:  ", openSockets[i]['token'])
            new_id = bo.incrementHexNumber(openSockets[i].last_mess)
            console.log("value= ", value)
            //mess = '14'+new_id+'0006767700310030'
            mess = genBlynkMessage(controller.pin_t, controller.pin+"", "write", value + "", new_id)
            openSockets[i]["last_mess"] = new_id;
            e.sock.write(Buffer.from(mess, 'hex'));
            console.log("SET SEND VALUE", bo.decodeCommand(mess),e.sock.remoteAddress,  mess);
            console.log("WTP: ", controller.path, value+"");
            writeToPath(ds.deviceList, controller.path, value+"");
            console.log("PATH ds.deviceList.devices[0].ui.controls[1].data[0].value =",ds.deviceList.devices[1].ui.controls[1].data[0].value )
        }
    })
}

/**
 * Функция проходится по дереву объекта и собирает объекты с найденными значениями ключа 'id' и их путями в исходном дереве.
 * @param {object|array} obj - Объект или массив, в котором нужно найти ключ 'id'.
 * @param {string[]} [path=[]] - Массив для хранения пути к текущему объекту.
 * @returns {array} - Массив объектов с найденными значениями ключа 'id' и их путями.
 */
function findObjectsWithIds(obj, path = [], f_key, f_value) {
    const result = [];
    // Проверяем, является ли переданный объект массивом
    if (Array.isArray(obj)) {
        // Если да, проходимся по каждому элементу массива
        obj.forEach((item, index) => {
            // Рекурсивно вызываем функцию для каждого элемента массива, добавляя индекс в путь
            findObjectsWithIds(item, path.concat(index), f_key, f_value).forEach(res => result.push(res));
        });
    } else if (typeof obj === 'object' && obj !== null) {
        // Если переданный объект не является массивом, проходимся по его ключам
        Object.keys(obj).forEach(key => {
            // Если текущий ключ равен 'id', добавляем объект с найденным значением и путем в результат
            if (key === f_key) {
                if(f_value === obj[f_key]){
                    let res = obj;
                    obj['path'] = path.slice()
                    result.push(obj);
                }
            } else {
                // Рекурсивно вызываем функцию для значений ключей, если это объект или массив,
                // добавляя ключ в путь
                findObjectsWithIds(obj[key], path.concat(key), f_key, f_value).forEach(res => result.push(res));
            }
        });
    }
    // Возвращаем массив объектов с найденными значениями ключа 'id' и их путями
    return result;
}

/**
 * Функция записывает данные в объект по указанному пути в виде массива.
 * @param {object} obj - Объект, в который нужно записать данные.
 * @param {array} path - Путь к месту записи данных в виде массива.
 * @param {*} value - Значение, которое нужно записать.
 */
function writeToPath(obj, path, value) {
    // Для каждого ключа из пути
    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        // Если это последний ключ в пути
        if (i === path.length - 1) {
            // Записываем значение по последнему ключу
            obj[key] = value;
        } else {
            // Если ключ не существует, создаем пустой объект или массив в зависимости от следующего ключа
            if (obj[key] === undefined || obj[key] === null) {
                obj[key] = typeof path[i + 1] === 'number' ? [] : {};
            }
            // Переходим к следующему уровню объекта
            obj = obj[key];
        }
    }
}
