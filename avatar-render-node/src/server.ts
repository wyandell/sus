import * as WSLib from 'ws';
import conf from './helpers/Config';
import * as models from './models';
import CommandHandler from './controllers';
let handle = new CommandHandler();
const ws = new WSLib.Server({
    port: conf.port || 3040,
});
import * as HTTPExceptions from 'ts-httpexceptions';

ws.on('connection', (c, req) => {
    console.log('[info] new connection');
    let url = req.url;
    if (!url) {
        console.log('[info] closing bad conn due to no url')
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
    if (key !== conf.authorization) {
        console.log('[info] closing bad conn due to non-matching key');
        return c.close();
    }
    c.on('message', async (data) => {
        let cmd = JSON.parse(data.toString()) as models.Command;
        console.log('[info] ' + cmd.command)
        // @ts-ignore
        if (typeof handle[cmd.command] !== 'function') {
            console.log('[err] sending 404 for invalidCommand: ' + cmd.command)
            return c.send(JSON.stringify({
                status: 404,
                code: 'InvalidCommand',
                id: cmd.id,
            }))
        }
        try {
            // @ts-ignore
            let results = await handle[cmd.command](cmd.args);
            return c.send(JSON.stringify({
                status: 200,
                data: results,
                id: cmd.id,
            }))
        } catch (err) {
            if (err instanceof HTTPExceptions.Exception && err! instanceof HTTPExceptions.InternalServerError) {
                return c.send(JSON.stringify({
                    status: err.status,
                    code: err.message,
                    errorDetails: err,
                    id: cmd.id,
                }))
            }
            console.error('[error] [ws handle try/catch]', err);
            return c.send(JSON.stringify({
                status: 500,
                code: 'InternalServerError',
                errorDetails: err,
                id: cmd.id,
            }));
        }
    })
});

export default () => {
    console.log('[info] ws server listeneing on port', (conf.port || 3040));
}