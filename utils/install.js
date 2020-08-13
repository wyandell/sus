const cp = require('child_process');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const net = require('net');

let nmPath = path.join(__dirname, './node_modules/');
if (!fs.existsSync(nmPath)) {
    console.log('[info] installing dependencies...')
    let out = cp.execSync('npm install', {
        cwd: __dirname,
    });
    console.log('[info] Please enter the command again. Sorry!');
    process.exit(15);
}

const chalk = require('chalk');
const redis = require('ioredis');
const rl = require('prompt-sync')()
const log = console.log;
const info = (...args) => {
    log(chalk.white('[info]'), ...args)
}
const warn = (...args) => {
    log(chalk.yellow('[warning]'), ...args)
}
const err = (...args) => {
    log(chalk.red('[err]'), ...args)
}
/*
if (process.platform !== 'linux') {
    log(chalk.red('[ERROR]'), 'Your current platform', chalk.yellow(process.platform), 'is not supported by this install script. Sorry!');
    // process.exit(1);
}
*/

// First, check if cookies file exists
if (!fs.existsSync(path.join(__dirname, '../cookies.txt'))) {
    err('Please create a file called "cookies.txt" and paste in a list of .ROBLOSECURITY cookies, seperated by new lines.');
    process.exit(1);
}

let wwwDir = path.join(__dirname, '../www/');
let confDir = path.join(wwwDir, './config.json');

const setupConfig = () => {
    info('Creating random keys...');
    /**
     * @type {*}
     */
    let conf = {
        cookiesKey: crypto.randomBytes(64).toString('base64').replace(/"/g, '\"'),
        csrfKey: crypto.randomBytes(64).toString('base64').replace(/"/g, '\"'),
    };
    // check for default conf
    let add = '127.0.0.1';
    let prefix = '2k12Roblox1';
    let port = 6379;
    let pass = '';
    const testRedis = () => {
        return new Promise((res, rej) => {
            info('Trying to connect to redis...');
            let attempt = new redis(port, add, {
                keyPrefix: prefix,
                password: pass,
                enableOfflineQueue: false,
            });
            attempt.on('ready', e => {
                attempt.setex('testing1234', 1, 'world', (rErr, ok) => {
                    if (rErr) {
                        // Ask for pass
                        err(rErr)
                        pass = rl('It looks like your redis server requires a password. Please enter it and press enter.\n');
                        if (!pass) {
                            err('Exiting due to no pass.');
                            process.exit(1);
                        }
                        attempt.disconnect();
                        testRedis().then(ok => {
                            res();
                        }).catch(e => {
                            err(e);
                            rej(e);
                        })
                    } else {
                        // Ok
                        conf.redis = {
                            host: add,
                            port,
                            keyPrefix: prefix,
                            enableOfflineQueue: true,
                            password: pass,
                        }
                        res()
                    }
                });
            });
            attempt.on('error', (e) => {
                // Install
                try {
                    attempt.disconnect();
                } catch (e) {

                }
                let isInstalled = rl('Do you have redis installed? [y/n]').toLowerCase();
                if (isInstalled !== 'y') {
                    if (process.platform === 'win32') {
                        err('Please install redis. Although you can download it from various websites, it is much easier to use Windows Subsystem for Linux.\n\nMore info here: https://docs.microsoft.com/en-us/windows/wsl/install-win10\n')
                    } else {
                        err('Please install redis. If you use ubuntu, this is as simple as:\n\n' + chalk.bold('sudo apt-get update && sudo apt-get install redis-server\n'));
                    }
                    process.exit(1);
                } else {
                    let newAdd = rl('Please specify the address/IP/Hostname (excluding the port). Currently: "' + add + '": ');
                    if (!newAdd) {
                        info('Address is not being updated.');
                    } else {
                        add = newAdd;
                    }

                    let newPort = parseInt(rl('Please specify the port of the redis server. Currently: "' + port + '": ').toLowerCase(), 10);
                    if (!Number.isInteger(newPort)) {
                        info('Port is not being updated.');
                    } else {
                        port = newPort;
                    }

                    let newPass = rl('If your redis server has a password/Auth, please enter it below. Currently: "' + pass + '": ');
                    if (!newPass && !pass) {
                        info('Password is not being updated.');
                    } else {
                        pass = newPass;
                    }
                    testRedis().then(() => {
                        res();
                    }).catch(err => {
                        rej(err);
                    })
                }
            })
        })
    }
    testRedis().then(ok => {
        log('Redis config OK. Continuing...');
        let doRender = rl('Do you want to enable R6 avatar rendering? [y/n]').toLowerCase();
        if (doRender === 'y') {
            // Enable render setup
            conf.avatarRender = {
                enabled: true,
            }
            let r = conf.avatarRender;

            let auth = crypto.randomBytes(32).toString('base64');
            let port = 8196;
            let add = 'http://127.0.0.1';
            let customAdd = rl('Do you have a custom render server address? Currently: ' + add + ':' + port.toString() + ': ');
            if (!customAdd) {
                info('No custom server is being used - it will be self hosted.');
            } else {
                let newAdd = customAdd.slice(0, customAdd.indexOf(':'));
                if (newAdd) {
                    add = newAdd;
                }
                let newPort = parseInt(customAdd.slice(customAdd.indexOf(':')), 10);
                if (Number.isInteger(newPort) && newPort <= 99999) {
                    port = newPort;
                }
            }
            r.address = add + ':' + port;
            r.authorization = auth;

            let rulesToAdd = rl('Please type out any rules, seperated by a comma.\nSee here for more info: https://github.com/Pokemonjpups/2012-roblox/tree/master/docs/avatar-render/rules.md').split(',');
            r.rules = rulesToAdd;

            info('Writing config to disk...')
            fs.writeFileSync(confDir, JSON.stringify(conf));
            info('Write OK. Writing avatar render config to disk...');
            let renderPath = path.join(__dirname, '../avatar-render-node/config.json');
            if (fs.existsSync(renderPath)) {
                warn('config.json file for avatar service already exists.');
                let isOk = rl('Can the config.json file in avatar-render-node folder be deleted [y/n]?\n');
                if (isOk.toLowerCase() === 'y') {
                    fs.unlinkSync(renderPath);
                    info('avatar-render-node/config.json file was deleted.');

                    fs.writeFileSync(renderPath, JSON.stringify({
                        port: port,
                        authorization: auth,
                    }));
                    info('Avatar render config file created.');
                    installModules();
                } else {
                    err('Exiting due to config conflict with avatar-render-node.');
                    process.exit(1);
                }
            } else {
                fs.writeFileSync(renderPath, JSON.stringify({
                    port: port,
                    authorization: auth,
                }));
                info('Avatar render config file created.');
                installModules();
            }
        } else {
            // Dont enable render setup
            info('Not setting up 3d avatar render service.');
            info('Writing config to disk...')
            fs.writeFileSync(confDir, JSON.stringify(conf));
            installModules();
        }
    });

    const installModules = () => {
        let renderPath = path.join(__dirname, '../avatar-render-node/');
        let wwwPath = path.join(__dirname, '../www/');

        let ss = 0;
        const startBuild = () => {
            info('Complete.\n\nTo run the program, enter this command:\n' + chalk.bold(`node ./utils/start.js`));
            process.exit(0);
        }
        let join = '; ';
        if (process.platform === 'win32') {
            join = '&& ';
        }
        cp.exec(`npm i ${join} npm run build`, {
            cwd: renderPath,
        }, (e, out, stdErr) => {
            if (e) {
                err(e);
            } else {
                if (stdErr) {
                    err(stdErr);
                } else {
                    info('Node modules for render service installed.');
                    ss++;
                    if (ss >= 2) {
                        startBuild();
                    }
                }
            }
        });
        cp.exec(`npm i ${join} npm run build`, {
            cwd: wwwPath,
        }, (e, out, stdErr) => {
            if (e) {
                err(e);
            } else {
                if (stdErr) {
                    err(stdErr);
                } else {
                    info('Node modules for www service installed.');
                    ss++;
                    if (ss >= 2) {
                        startBuild();
                    }
                }
            }
        });
    }

    // Quick check if exists
    // Check if redis port is ok. If works, and no auth, then just go with default (and maybe give warning about pass). If can't connect, ask for redis info, try to connect, then continue. Also can try installing it with child process (sudo apt-get install redis)
}
if (fs.existsSync(confDir)) {
    // Confirm it's valid
    let file = fs.readFileSync(confDir).toString();
    try {
        JSON.parse(file);
    } catch (err) {
        warn('config.json file for www service is invalid json. It should be deleted.');
        let isOk = rl('Can the config.json file in www folder be deleted [y/n]?\n');
        if (isOk.toLowerCase() === 'y') {
            fs.unlinkSync(file);
            info('www/config.json file was deleted.');
            setupConfig();
        } else {
            err('Exiting due to config conflict.');
            process.exit(1);
        }
    }
    log('config.json for www service already exists, so it is not going to be setup. If you need to a setup a new one (such as for a version upgrade), please delete or move the config.json file.');
} else {
    log('config.json for www service does not exist, so it is being created.');
    setupConfig();
}