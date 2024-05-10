var replaceall = require("replaceall");

module.exports.incrementHexNumber = incrementHexNumber;
module.exports.decodeCommand = decodeCommand;
module.exports.getMessId = getMessId;
module.exports.getCommand = getCommand;
module.exports.decodeBlynkMessHw = decodeBlynkMessHw;
module.exports.genBlynkMessage = genBlynkMessage;


/**
 * Функция для расшифровки статуса сообщения
 * Берет первый байт сообщения
 * @param {string} binaryHexString - Бинарная строка в формате hex.
 * @returns {string} - строка.
 */
function decodeCommand(binaryHexString) {
    BlynkCmd = [
        "BLYNK_CMD_RESPONSE",
        "BLYNK_CMD_REGISTER",
        "BLYNK_CMD_LOGIN",
        "BLYNK_CMD_SAVE_PROF",
        "BLYNK_CMD_LOAD_PROF",
        "BLYNK_CMD_GET_TOKEN",
        "BLYNK_CMD_PING",
        "BLYNK_CMD_ACTIVATE",
        "BLYNK_CMD_DEACTIVATE",
        "BLYNK_CMD_REFRESH",
        "BLYNK_CMD_GET_GRAPH_DATA",
        "BLYNK_CMD_GET_GRAPH_DATA_RESPONSE",
        "BLYNK_CMD_TWEET",
        "BLYNK_CMD_EMAIL",
        "BLYNK_CMD_NOTIFY",
        "BLYNK_CMD_BRIDGE",
        "BLYNK_CMD_HARDWARE_SYNC",
        "BLYNK_CMD_INTERNAL",
        "BLYNK_CMD_SMS",
        "BLYNK_CMD_PROPERTY",
        "BLYNK_CMD_HARDWARE",
        "BLYNK_CMD_CREATE_DASH",
        "BLYNK_CMD_SAVE_DASH",
        "BLYNK_CMD_DELETE_DASH",
        "BLYNK_CMD_LOAD_PROF_GZ",
        "BLYNK_CMD_SYNC",
        "BLYNK_CMD_SHARING",
        "BLYNK_CMD_ADD_PUSH_TOKEN",
        "NONE",
        //sharing commands
        "BLYNK_CMD_GET_SHARED_DASH",
        "BLYNK_CMD_GET_SHARE_TOKEN",
        "BLYNK_CMD_REFRESH_SHARE_TOKEN",
        "BLYNK_CMD_SHARE_LOGIN",
        "", "", "", "", "", "", "", "",
        "BLYNK_CMD_REDIRECT",
        "", "", "", "", "", "", "", "", "", "", "", "", "",
        "BLYNK_CMD_DEBUG_PRINT",
        "", "", "", "", "", "", "", "",
        "BLYNK_CMD_EVENT_LOG"
    ];
    //console.log(binaryHexString.toString('hex').slice(0,1))
    //console.log(int_value)
    //console.log(int_value)
    let int_value = Number("0x" + binaryHexString.toString('hex').slice(0, 2));
    //console.log(BlynkCmd[int_value])
    return BlynkCmd[int_value]
}

/**
 * Функция для инкрементации числа, представленного в виде бинарной строки в формате hex.
 * @param {string} binaryHexString - Бинарная строка в формате hex.
 * @returns {string} - Инкрементированная бинарная строка в формате hex.
 */
function incrementHexNumber(binaryHexString) {
    //console.log('binaryHexString',binaryHexString)
    // Преобразуем бинарную строку в hex
    let hexString = binaryHexString.toString('hex');
    //console.log('hexString 1',hexString)
    // Получаем число
    let numberToIncrement = parseInt(hexString, 16);
    //console.log('numberToIncrement 1',numberToIncrement)
    // Инкрементируем число
    numberToIncrement++;
    //console.log('numberToIncrement 2',numberToIncrement)

    // Проверяем переполнение и корректируем, если нужно
    if (numberToIncrement > 65535) {
        numberToIncrement = 1; // Обнуляем, если переполнено
    }
    //console.log('numberToIncrement',numberToIncrement)
    // Форматируем обратно в hex
    let incrementedHexString = numberToIncrement.toString(16).padStart(4, '0');
    //console.log(incrementedHexString)
    // Возвращаем результат
    return Buffer.from(incrementedHexString, 'hex').toString('hex');
}

/**
 * Функция для получения id сообщения из пакета
 * Берет 2 и 3 байты
 * @param {string} binaryHexString - Бинарная строка в формате hex.
 * @returns {string} - строка.
 */
function getMessId(binaryHexString) {
    return binaryHexString.toString('hex').slice(2, 6);
}

/**
 * Функция для получения команды из пакета
 * Берет 2 и 3 байты
 * @param {string} binaryHexString - Бинарная строка в формате hex.
 * @returns {string} - строка.
 */
function getCommand(binaryHexString) {
    return binaryHexString.toString('hex').slice(0, 2);
}

/**
 * Функция для разбора пакета по кускам
 *  * @param {string} binaryHexString - Бинарная строка в формате hex.
 * @returns {{length, id, message, command}} - строка.
 */
function decodeBlynkMessHw(e) {
    let command = e.slice(0, 2)
    let id = e.slice(2, 6)
    let len = e.slice(6, 10)
    let mess = Buffer.from(e.slice(10), 'hex').toString('utf8') //replaceall('\u0000',' ',);
    return ({"command":command,"id":id,"length":len,"message":mess})
}

/**
 * Функция, которая принимает строку и преобразует её в строку, где каждый символ представлен своим кодом в hex символа в Unicode.
 * @param {string} str - строка
 * @returns {string} - строка.
 */
function strToHex(str) {
    // Разбиваем строку на массив отдельных символов, преобразуем каждый символ в его код в hex символа в Unicode и объединяем обратно в строку.
    return str.split('').map(char => char.charCodeAt(0).toString(16)).join('');
}

/**
 * Функция для генерации тела сообщения для blynk
 * @param {string} type_pin - тип пина (digital, analog, virtual)
 * @param {string} number_pin - номер пина
 * @param {string} function_pin - тип пина (read, write)
 * @param {string} value_pin - значение пина
 * @param {string} id_message - id сообщения
 * @returns {string, false} - строка или false при ошибке.
 */
function genBlynkMessage(type_pin, number_pin, function_pin, value_pin,id_message) {
    let mess = '14' + id_message // "BLYNK_CMD_NOTIFY" + id message
    let body = ""
    switch (type_pin) {
        case 'digital':
            if (function_pin === 'read') {
                body = strToHex("dr") + '00' + strToHex(number_pin)//dr x
                mess +=  (body.length / 2 ).toString(16).padStart(4,'0') + body
            }
            else if (function_pin === 'write') {
                body = strToHex("aw") + '00' + strToHex(number_pin) + '00' + strToHex(value_pin) //aw x xxx
                mess +=  (body.length / 2 ).toString(16).padStart(4,'0') + body
            }
            else{
                return false
            }
            break
        case 'virtual':
            if (function_pin === 'read') {
                body = strToHex("vr") + '00' + strToHex(number_pin)//vr x
                mess +=  (body.length / 2 ).toString(16).padStart(4,'0') + body
            }
            else if (function_pin === 'write') {
                body = strToHex("vw") + '00' + strToHex(number_pin) + '00' + strToHex(value_pin) //vw x xxx
                mess +=  (body.length / 2 ).toString(16).padStart(4,'0') + body
            }
            else{
                return false
            }
            break
        case 'analog':
            body = strToHex("ar") + '00' + strToHex(number_pin)//ar 17?
            mess +=  (body.length / 2 ).toString(16).padStart(4,'0') + body
            break
        default: return false
    }
    return mess
}
function rgbToHex(r, g, b) {
    return (r << 16) | (g << 8) | b;
}
