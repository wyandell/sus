"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const WSLib = require("ws");
const Config_1 = require("./helpers/Config");
const controllers_1 = require("./controllers");
let handle = new controllers_1.default();
const ws = new WSLib.Server({
    port: Config_1.default.port || 3040,
});
const HTTPExceptions = require("ts-httpexceptions");
ws.on('connection', (c, req) => {
    console.log('[info] new connection');
    let url = req.url;
    if (!url) {
        console.log('[info] closing bad conn due to no url');
        return c.close();
    }
    let q = url.indexOf('?');
    if (q === -1) {
        console.log('[info] closing bad conn due to no query param');
        return c.close();
    }
    let d = new URLSearchParams(url.slice(q));
    let key = d.get('key');
    if (!key) {
        console.log('[info] closing bad conn due to no key');
        return c.close();
    }
    key = decodeURIComponent(key);
    if (key !== Config_1.default.authorization) {
        console.log('[info] closing bad conn due to non-matching key');
        return c.close();
    }
    c.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        let cmd = JSON.parse(data.toString());
        console.log('[info] ' + cmd.command);
        // @ts-ignore
        if (typeof handle[cmd.command] !== 'function') {
            console.log('[err] sending 404 for invalidCommand: ' + cmd.command);
            return c.send(JSON.stringify({
                status: 404,
                code: 'InvalidCommand',
                id: cmd.id,
            }));
        }
        try {
            // @ts-ignore
            let results = yield handle[cmd.command](cmd.args);
            return c.send(JSON.stringify({
                status: 200,
                data: results,
                id: cmd.id,
            }));
        }
        catch (err) {
            if (err instanceof HTTPExceptions.Exception && err instanceof HTTPExceptions.InternalServerError) {
                return c.send(JSON.stringify({
                    status: err.status,
                    code: err.message,
                    errorDetails: err,
                    id: cmd.id,
                }));
            }
            console.error('[error] [ws handle try/catch]', err);
            return c.send(JSON.stringify({
                status: 500,
                code: 'InternalServerError',
                errorDetails: err,
                id: cmd.id,
            }));
        }
    }));
});
exports.default = () => {
    console.log('[info] ws server listeneing on port', (Config_1.default.port || 3040));
};
//# sourceMappingURL=server.js.map