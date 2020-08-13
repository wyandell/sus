import StdExceptions from '../helpers/Exceptions';
import * as models from '../models';
import * as cookie from '../helpers/Cookies';
import Axios, { AxiosError } from 'axios';
const client = Axios.create({});
let sleep = require('util').promisify(setTimeout);
client.interceptors.response.use(undefined, e => {
    if (e.isAxiosError) {
        let err = e as AxiosError;
        if (err.response && err.config) {
            if (err.response.status === 403 && err.response.headers['x-csrf-token'] && err.config) {
                err.config.headers['x-csrf-token'] = err.response.headers['x-csrf-token']
                return client.request(err.config)
            } else if (err.response.status === 429 || err.response.status >= 500) {
                console.log('[warn] axios got ' + err.response.status + ' for URL:', err.config.url);
                return sleep(500).then(() => {
                    return client.request(err.config)
                })
            }
        } else if (!err.response && err.config) {
            return client.request(err.config)
        }
    }
    return Promise.reject(e);
});
/**
 * Handle incoming WS commands
 */
export default class CommandHandler extends StdExceptions {
    /**
     * Get the status of the web server
     */
    public async status() {
        return {
            status: 'OK',
        }
    }

    /**
     * Generate a user avatar thumbnail
     * @param user 
     */
    public async GenerateThumbnail(user: models.AvatarRenderRequest): Promise<string> {
        console.log('gen thumb');
        let cook: any;
        let cookieOk = false;
        while (!cookieOk) {
            console.log('while true');
            cook = cookie.get();
            try {
                await client.get('https://users.roblox.com/v1/users/authenticated', {
                    headers: {
                        'cookie': '.ROBLOSECURITY=' + cook.cookie,
                    }
                });
                cookieOk = true
            } catch (err) {
                console.log('[info] bad cookie');
            }
        }
        console.log('[info] cookie ok. rendering');
        try {
            let assets = user.assets.map(val => { return val.id });
            let colors = user.bodyColors;
            let conf = {
                headers: {
                    'cookie': '.ROBLOSECURITY=' + cook.cookie,
                }
            }
            // set to r6
            await client.post('https://avatar.roblox.com/v1/avatar/set-player-avatar-type', { playerAvatarType: 'R6' }, conf);
            // update colors
            await client.post('https://avatar.roblox.com/v1/avatar/set-body-colors', colors, conf);
            // wear items 
            let wear: any = { data: { final: false } }
            while (!wear.data.final) {
                wear = await client.get('https://avatar.roblox.com/v1/try-on/2d?assetIds=' + encodeURIComponent(
                    assets.join(',')
                ) + '&width=420&height=420&format=png&addAccoutrements=false', conf);
                if (!wear.data.final) {
                    console.log('[info] loading thumb...');
                    await sleep(500);
                }
            }
            console.log('wear results', wear.data);
            return wear.data.url;
        } catch (e) {
            console.error(e);
            cook.done();
            throw e;
        }
    }
}