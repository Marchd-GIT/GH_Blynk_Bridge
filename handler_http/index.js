const config = (require('read-appsettings-json').AppConfiguration).json;
const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = config.log.level;

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
            console.log("UI_HTTP")
            ds.deviceList.devices.forEach((D)=>{
                if (D.device.id === id) {
                    res.end(gh.encodeHubJson(D.ui));
                }
            })
            break;
        case /\/hub\/.*/.test(req.url):
            let ui = common.findObjectsWithIds(ds.deviceList,[],"prefix", prefix)[0]
            res.writeHead(200);
            res.end(gh.encodeHubJson(ui))
            break;
        case /\/hub\/.*\/.*\/.*\/info/.test(req.url):
            res.writeHead(200);
            res.end('#{#1:"100000",#3:#19,"info":{"version":{"Library":"1.0.1a"},"net":{},"memory":{},"system":{"Uptime":"'+process.uptime().toString().split(".")[0]+'","Platform":"GH_Blynk_Bridge"}}}#')
            break;
        case /\/hub\/.*\/.*\/.*\/files/.test(req.url):
            res.writeHead(200);
            res.end('#{"fs":{"/":0},#1:"'+id+'",#3:#1c,#15:0,#14:0}#');
            break;
        default:
            res.writeHead(200);
            res.end(JSON.stringify({error: "Command not found, return 200 ok"}));
    }
};

module.exports.onConnectHTTP = onConnectHTTP;