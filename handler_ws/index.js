const ws = require('../index')
const config = (require('read-appsettings-json').AppConfiguration).json;
const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = config.log.level;


const common = require("../common");
const ds = require("../state_control");
const gh = require("../gyver_hub");
const bo = require("../bin_operation");
const tcp = require("../handler_tcp");

function onConnectWS(wsClient) {
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
                    ws.ws_server.broadcast('#{#1:"'+id+'",#3:#4,#5:{"'+widget.split('=')[0]+'":{#30:"'+widget.split('=')[1]+'"}}}#');
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
function getDeviceValue(message,length,id) {
    let logger = log4js.getLogger("getDeviceValue");
    logger.trace(message,length,id);
    let pin = message.split('_')[1]
    let value = message.split('_')[2].replace(/"$/g,'')
    let type = {"v":"virtual","d":"digital","a":"analog"}[message[1]]
    logger.trace(type, pin, value, id);
    let controllers = common.findObjectsWithIds(ds.deviceList,[],'token',id)
    let controller = controllers.find((element)=>{
        logger.trace("IF:", element.pin_t , type)
        if (element.pin === pin*1 && element.pin_t === type ) return true
    })
    controller.path.push("value")
    //logger.trace(controller);
    logger.trace("WTP: ", controller.path, value+"");
    common.writeToPath(ds.deviceList, controller.path, value+"");
    id_dev = ds.deviceList.devices[controller.path[1]].device.id
    logger.trace('#{#1:'+id_dev+',#3:#4,#5:{"'+controller.id+'":{#30:"'+value+'"}}}#')
    ws.ws_server.broadcast('#{#1:'+id_dev+',#3:#4,#5:{"'+controller.id+'":{#30:"'+value+'"}}}#');

}

module.exports.onConnectWS = onConnectWS;
module.exports.getDeviceValue = getDeviceValue;
