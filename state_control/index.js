const fs = require('fs');

let deviceUpdateControl = 0;
let deviceList = {};
let deviceListState = "";

function saveDeviceList() {
    const data = JSON.stringify(deviceList, null, 2);
    fs.writeFile('./devices_state.json', data, (err) => {
        if (err) throw err;
        deviceListState = data;
        console.log('The ./devices_state.json changed and saved ');
        deviceUpdateControl++;
    });
}

function updateDeviceList() {
    fs.readFile('./devices_state.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        try {
            deviceList = JSON.parse(data);
            deviceListState = data;
            console.log("Updated ./devices_state.json");
        } catch (e) {
            console.error(e.message);
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
    console.log("device_update_control ", deviceUpdateControl);
    if (deviceUpdateControl > 0) {
        deviceUpdateControl--;
    } else {
        updateDeviceList();
    }
});