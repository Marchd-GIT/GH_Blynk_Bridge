const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = "trace";


const common = require("../common");
const ds = require("../state_control");
const gh = require("../gyver_hub");
const bo = require("../bin_operation");
const tcp = require("../tcp_handler");


function onConnectWS(wsClient, wsServer) {
    let logger = log4js.getLogger("onConnectWS");
    logger.info('new ws client',);
    //wsClient.send('#{#1:"100000",#3:#17}#');

    wsClient.on('close', function () {
       logger.info('client disconnected');
    });

    wsClient.on('message', function (message) {
        let widget = message.toString().split('/')[4]
        let id = message.toString().split("/")[1]
       logger.info(message.toString());
        try {
            switch (true) {
                case /.*\/.*\/.*\/set\/.*/.test(message):
                    setDeviceValue( widget,id )
                    wsClient.send('#{#1:"'+id+'",#3:#17}#');
                    wsClient.send('#{#1:"'+id+'",#3:#18,#a:"'+widget.split('=')[0]+'"}#');
                    wsServer.broadcast('#{#1:"'+id+'",#3:#4,#5:{"'+widget.split('=')[0]+'":{#30:"'+widget.split('=')[1]+'"}}}#');
                    break;
                case /.*\/.*\/.*\/ping/.test(message):
                    wsClient.send('#{#1:"'+id+'",#3:#17}#');
                    break;
                case /.*\/.*\/.*\/unix/.test(message):
                    wsClient.send('#{#1:"'+id+'",#3:#17}#');
                    break;
                case /.*\/.*\/.*\/ui/.test(message):
                   logger.info("HG DEVICE ID HTTP: ",id)
                    ds.deviceList.devices.forEach((D)=>{
                        if (D.device.id === id) {
                            wsClient.send(gh.encodeHubJson(D.ui))
                        }
                    })
                    break;
                default:
                   logger.info('Неизвестная команда');
                    break;
            }
        } catch (error) {
           logger.info('Ошибка', error);
        }
    });
}

function setDeviceValue(set,id) {
    let logger = log4js.getLogger("setDeviceValue");
    let mess;
    let new_id;
    let widget = set.split('=')[0]
    let value = set.split('=')[1]
    let controllers = common.findObjectsWithIds(ds.deviceList,[],'id',id) // ищем устройство с нужным id
    let controller = common.findObjectsWithIds(controllers,[],'id',widget)[0] // ищем в устройстве нужный контроллер
    let index = controller.path.shift() // сдвигаем массив на один элемент влево, запоминаем элемент
    controller.path = controllers[index].path.concat(controller.path) // находим полный путь к контроллеру
    controller.path.push("value")
    tcp.openSockets.forEach((e, i) => {
        logger.trace("IF:  ",tcp.openSockets[i]["token"],controller.token)
        if(tcp.openSockets[i]["token"] === controller.token){
            logger.trace("MGMT:  ", tcp.openSockets[i]['token'])
            new_id = bo.incrementHexNumber(tcp.openSockets[i].last_mess)
            mess = bo.genBlynkMessage(controller.pin_t, controller.pin+"", "write", value + "", new_id)
            tcp.openSockets[i]["last_mess"] = new_id;
            e.sock.write(Buffer.from(mess, 'hex'));
            logger.info("SEND VALUE", bo.decodeCommand(mess),e.sock.remoteAddress,  mess);
            logger.trace("WTP: ", controller.path, value+"");
            common.writeToPath(ds.deviceList, controller.path, value+"");
        }
    })
}

module.exports.onConnectWS = onConnectWS;
