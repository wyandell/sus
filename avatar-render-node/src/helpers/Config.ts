interface IWebsiteConfiguration {
    authorization: string;
    port?: number;
}

const conf: Readonly<IWebsiteConfiguration> = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '../../config.json')).toString())
export default conf;