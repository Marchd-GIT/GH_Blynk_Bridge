const config = (require('read-appsettings-json').AppConfiguration).json;
const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = config.log.level;

let openSockets = [];




const bo = require("../bin_operation");
const {decodeBlynkMessHw, genBlynkMessage} = require("../bin_operation");
const common = require("../common");
const ds = require("../state_control");


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
                common.findObjectsWithIds(ds.deviceList,[],'token', openSockets[sock_num]["token"]).forEach((C)=>{
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




module.exports.onClientTCP = onClientTCP;
module.exports.openSockets = openSockets;
