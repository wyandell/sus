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
const Exceptions_1 = require("../helpers/Exceptions");
const cookie = require("../helpers/Cookies");
const axios_1 = require("axios");
const client = axios_1.default.create({});
let sleep = require('util').promisify(setTimeout);
client.interceptors.response.use(undefined, e => {
    if (e.isAxiosError) {
        let err = e;
        if (err.response && err.config) {
            if (err.response.status === 403 && err.response.headers['x-csrf-token'] && err.config) {
                err.config.headers['x-csrf-token'] = err.response.headers['x-csrf-token'];
                return client.request(err.config);
            }
            else if (err.response.status === 429 || err.response.status >= 500) {
                console.log('[warn] axios got ' + err.response.status + ' for URL:', err.config.url);
                return sleep(500).then(() => {
                    return client.request(err.config);
                });
            }
        }
        else if (!err.response && err.config) {
            return client.request(err.config);
        }
    }
    return Promise.reject(e);
});
/**
 * Handle incoming WS commands
 */
class CommandHandler extends Exceptions_1.default {
    /**
     * Get the status of the web server
     */
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                status: 'OK',
            };
        });
    }
    /**
     * Generate a user avatar thumbnail
     * @param user
     */
    GenerateThumbnail(user) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('gen thumb');
            let cook;
            let cookieOk = false;
            while (!cookieOk) {
                console.log('while true');
                cook = cookie.get();
                try {
                    yield client.get('https://users.roblox.com/v1/users/authenticated', {
                        headers: {
                            'cookie': '.ROBLOSECURITY=' + cook.cookie,
                        }
                    });
                    cookieOk = true;
                }
                catch (err) {
                    console.log('[info] bad cookie');
                }
            }
            console.log('[info] cookie ok. rendering');
            try {
                let assets = user.assets.map(val => { return val.id; });
                let colors = user.bodyColors;
                let conf = {
                    headers: {
                        'cookie': '.ROBLOSECURITY=' + cook.cookie,
                    }
                };
                // set to r6
                yield client.post('https://avatar.roblox.com/v1/avatar/set-player-avatar-type', { playerAvatarType: 'R6' }, conf);
                // update colors
                yield client.post('https://avatar.roblox.com/v1/avatar/set-body-colors', colors, conf);
                // wear items 
                let wear = { data: { final: false } };
                while (!wear.data.final) {
                    wear = yield client.get('https://avatar.roblox.com/v1/try-on/2d?assetIds=' + encodeURIComponent(assets.join(',')) + '&width=420&height=420&format=png&addAccoutrements=false', conf);
                    if (!wear.data.final) {
                        console.log('[info] loading thumb...');
                        yield sleep(500);
                    }
                }
                console.log('wear results', wear.data);
                return wear.data.url;
            }
            catch (e) {
                console.error(e);
                cook.done();
                throw e;
            }
        });
    }
}
exports.default = CommandHandler;
//# sourceMappingURL=index.js.map