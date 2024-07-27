"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MbusMaster = require("node-mbus");
var mbusMaster = new MbusMaster({
    host: '10.30.2.100',
    port: 10001,
    timeout: 2000,
    autoConnect: true
});
mbusMaster.connect();
mbusMaster.getData(2, function (err, data) {
    console.log(err);
    console.log(data);
    mbusMaster.close();
});
