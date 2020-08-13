// this entire file should really be moved to a service...
import Config from './Config';
import base from '../services/base';
import * as ws from 'ws';
import * as crypto from 'crypto';

const Base = new base();
interface IAvatarData {
    userId: number;
    bodyColors: {
        headColorId: number;
        torsoColorId: number;
        rightArmColorId: number;
        leftArmColorId: number;
        rightLegColorId: number;
        leftLegColorId: number;
    };
    playerAvatarType: 'R6' | 'R15';
    assets: {
        id: number;
    }[];
}
const commandsCallbackMap: Map<string, (...args: any[]) => any> = new Map();
let client: ws;
const setupNewClient = () => {
    if (!Config.avatarRender.enabled) {
        throw new Error('Avatar render system is not enabled');
    }
    let authKey = encodeURIComponent(Config.avatarRender.authorization);
    client = new ws(Config.avatarRender.address + '?key=' + authKey);
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
    })
}
const waitUntilReady = () => {
    return new Promise((res, rej) => {
        client.on('open', () => {
            res();
        })
    });
}
const sendCommand = (cmd: string, args: any): Promise<any> => {
    return new Promise(async (res, rej) => {
        if (!client || client.readyState === 3 || client.readyState === 2) {
            setupNewClient();
        }
        if (client.readyState !== 1) {
            await waitUntilReady();
        }
        let id = crypto.randomBytes(8).toString('hex');
        client.send(JSON.stringify({
            'command': cmd,
            'args': args,
            'id': id,
        }))
        const resolveData = (args: any) => {
            res(args);
        }
        commandsCallbackMap.set(id, resolveData);
    });
}
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
export const requestThumbnail = async (userId: number | IAvatarData): Promise<string> => {
    if (!Config.avatarRender.enabled) {
        return 'https://www.roblox.com/Thumbs/Avatar.ashx?x=420&y=420&userid=' + userId;
    }

    let d: IAvatarData;
    if (typeof userId === 'number') {
        try {
            let data = await Base.get('https://avatar.roblox.com/v1/users/' + userId + '/avatar');
            data.assets = data.assets.filter((val: { assetType: { id: number } }) => {
                return badAssetTypes.includes(val.assetType.id) === false
            })
            data.userId = userId;
            d = data;
        } catch (err) {
            if (err.isAxiosError && err.response && err.response.status === 400) {
                // Invalid User, so use new route thing
                let data = await Base.get('https://avatar.roblox.com/v1/avatar-fetch/?placeId=5354656291&userId=' + userId);
                d = {
                    bodyColors: data.bodyColors,
                    assets: data.assetAndAssetTypeIds.map((val: { assetId: number; assetTypeId: number }) => {
                        return {
                            id: val.assetId,
                        }
                    }).filter((val: { assetTypeId: number }) => {
                        return badAssetTypes.includes(val.assetTypeId) === false
                    }),
                    playerAvatarType: data.resolvedAvatarType,
                    userId: userId,
                }
            } else {
                throw err;
            }
        }

    } else {
        d = userId;
    }
    let addAssets: number[] = [];
    if (Config.avatarRender.special) {
        for (const user of Config.avatarRender.special) {
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
    d.assets = [... new Set(d.assets.map(val => { return val.id }))].map(val => {
        return {
            id: val,
        };
    });
    let results = await sendCommand('GenerateThumbnail', d);
    console.log('[info] avatar render results', results);
    if (results.status === 200) {
        return results.data;
    } else {
        console.log('[warning] got unknown error during avatar render', results);
        return '/img/Pending.png';
    }
}