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
exports.requestThumbnail = void 0;
// this entire file should really be moved to a service...
const Config_1 = require("./Config");
const base_1 = require("../services/base");
const ws = require("ws");
const crypto = require("crypto");
const Base = new base_1.default();
const commandsCallbackMap = new Map();
let client;
const setupNewClient = () => {
    if (!Config_1.default.avatarRender.enabled) {
        throw new Error('Avatar render system is not enabled');
    }
    let authKey = encodeURIComponent(Config_1.default.avatarRender.authorization);
    client = new ws(Config_1.default.avatarRender.address + '?key=' + authKey);
    client.on('open', () => {
        client.on('message', msg => {
            let decoded = JSON.parse(msg.toString());
            let func = commandsCallbackMap.get(decoded.id);
            if (func) {
                func(decoded);
            }
        });
    });
    client.on('error', (err) => {
        console.error('[error] [avatar render ws server]', err);
    });
};
const waitUntilReady = () => {
    return new Promise((res, rej) => {
        client.on('open', () => {
            res();
        });
    });
};
const sendCommand = (cmd, args) => {
    return new Promise((res, rej) => __awaiter(void 0, void 0, void 0, function* () {
        if (!client || client.readyState === 3 || client.readyState === 2) {
            setupNewClient();
        }
        if (client.readyState !== 1) {
            yield waitUntilReady();
        }
        let id = crypto.randomBytes(8).toString('hex');
        client.send(JSON.stringify({
            'command': cmd,
            'args': args,
            'id': id,
        }));
        const resolveData = (args) => {
            res(args);
        };
        commandsCallbackMap.set(id, resolveData);
    }));
};
let badAssetTypes = [
    61,
    56,
    55,
    54,
    53,
    52,
    51,
    50,
    49,
    48,
    32,
    24,
];
exports.requestThumbnail = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Config_1.default.avatarRender.enabled) {
        return 'https://www.roblox.com/Thumbs/Avatar.ashx?x=420&y=420&userid=' + userId;
    }
    let d;
    if (typeof userId === 'number') {
        try {
            let data = yield Base.get('https://avatar.roblox.com/v1/users/' + userId + '/avatar');
            data.assets = data.assets.filter((val) => {
                return badAssetTypes.includes(val.assetType.id) === false;
            });
            data.userId = userId;
            d = data;
        }
        catch (err) {
            if (err.isAxiosError && err.response && err.response.status === 400) {
                // Invalid User, so use new route thing
                let data = yield Base.get('https://avatar.roblox.com/v1/avatar-fetch/?placeId=5354656291&userId=' + userId);
                d = {
                    bodyColors: data.bodyColors,
                    assets: data.assetAndAssetTypeIds.map((val) => {
                        return {
                            id: val.assetId,
                        };
                    }).filter((val) => {
                        return badAssetTypes.includes(val.assetTypeId) === false;
                    }),
                    playerAvatarType: data.resolvedAvatarType,
                    userId: userId,
                };
            }
            else {
                throw err;
            }
        }
    }
    else {
        d = userId;
    }
    let addAssets = [];
    if (Config_1.default.avatarRender.special) {
        for (const user of Config_1.default.avatarRender.special) {
            if (user.userId === d.userId) {
                addAssets = user.assets;
            }
        }
    }
    if (d.playerAvatarType === 'R6' && addAssets.length === 0) {
        return 'https://www.roblox.com/Thumbs/Avatar.ashx?x=420&y=420&userid=' + userId;
    }
    addAssets.forEach(val => {
        d.assets.push({
            id: val,
        });
    });
    // de-dupe assets before making request
    d.assets = [...new Set(d.assets.map(val => { return val.id; }))].map(val => {
        return {
            id: val,
        };
    });
    let results = yield sendCommand('GenerateThumbnail', d);
    console.log('[info] avatar render results', results);
    if (results.status === 200) {
        return results.data;
    }
    else {
        console.log('[warning] got unknown error during avatar render', results);
        return '/img/Pending.png';
    }
});
//# sourceMappingURL=AvatarRender.js.map