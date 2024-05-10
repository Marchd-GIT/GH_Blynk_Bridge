const config = (require('read-appsettings-json').AppConfiguration).json;
const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = config.log.level;

const fs = require('fs');
let deviceUpdateControl = 0;
let deviceList = {};
let deviceListState = "";

function saveDeviceList() {
    let logger = log4js.getLogger("saveDeviceList");
    const data = JSON.stringify(deviceList, null, 2);
    fs.writeFile('./devices_state.json', data, (err) => {
        if (err) logger.error(err);
        deviceListState = data;
        logger.info('./devices_state.json changed and saved ');
        deviceUpdateControl++;
    });
}

function updateDeviceList() {
    let logger = log4js.getLogger("updateDeviceList");
    fs.readFile('./devices_state.json', 'utf8', (err, data) => {
        if (err) {
            logger.error(err);
            return;
        }
        try {
            deviceList = JSON.parse(data);
            deviceListState = data;
            logger.info("./devices_state.json updated");
        } catch (e) {
            logger.error(e.message);
        }
    });
}

// Устанавливаем геттер и сеттер для переменной deviceList
Object.defineProperty(module.exports, 'deviceList', {
    get: function() {
        return deviceList;
    },
    set: function(newDeviceList) {
        deviceList = newDeviceList;
        saveDeviceList();
    }
});

updateDeviceList();

setInterval(() => {
    if (deviceListState !== JSON.stringify(deviceList, null, 2)) {
        saveDeviceList();
    }
}, 100);

fs.watchFile('./devices_state.json', { interval: 90 }, () => {
    let logger = log4js.getLogger("watchFile");
    logger.trace("device_update_control flag =", deviceUpdateControl);
    if (deviceUpdateControl > 0) {
        deviceUpdateControl--;
    } else {
        updateDeviceList();
    }
});