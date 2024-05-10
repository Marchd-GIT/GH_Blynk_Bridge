const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = "trace";

const ds = require("../state_control");
const gh = require("../gyver_hub");
const common = require("../common");
const onConnectHTTP = async function (req, res) {
    let logger = log4js.getLogger("onConnectHTTP");
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Private-Network", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    let id = req.url.split("/")[3]
    let prefix = req.url.split("/")[2]
    logger.info("Request URL: ",req.url)
    switch (true) {
        case /\/hub\/.*\/.*\/.*\/ui/.test(req.url):
            res.writeHead(200);
            ds.deviceList.devices.forEach((D)=>{
                if (D.device.id === id) {
                    res.end(gh.encodeHubJson(D.device));
                }
            })
            break;
        case /\/hub\/.*/.test(req.url):
            let ui = common.findObjectsWithIds(ds.deviceList,[],"prefix", prefix)[0]
            res.writeHead(200);
            res.end(gh.encodeHubJson(ui))
            break;
        default:
            res.writeHead(200);
            res.end(JSON.stringify({error: "Command not found, return 200 ok"}));
    }
};

module.exports.onConnectHTTP = onConnectHTTP;