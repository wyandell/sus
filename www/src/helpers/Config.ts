interface IWebsiteConfiguration {
    port?: number;
    cookiesKey: string;
    csrfKey: string;
    redis: IORedis.RedisOptions;
    avatarRender: { enabled: false; } | {
        enabled: true;
        address: string;
        authorization: string;
        rules?: "NoRthro" | "2012AndBelow"[];
        /**
         * If specified, this will add the {assets} array of assetIds to the {userId}'s thumbnail
         */
        special?: {
            userId: number;
            assets: number[];
        }[]
    }
}
import { join } from 'path';
import { readFileSync } from 'fs';
import * as IORedis from 'ioredis';
const conf = readFileSync(join(__dirname, '../../config.json')).toString();

export default JSON.parse(conf) as Readonly<IWebsiteConfiguration>;