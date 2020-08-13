const fs = require('fs');
const path = require('path');
const confFile = path.join(__dirname, '../www/config.json');
const cp = require('child_process');
if (!fs.existsSync(confFile)) {
    console.error('Config.json in www service does not exist. Please create it, or run node install.js');
    process.exit(1);
}
let escapeShell = (cmd) => {
    return '"' + cmd.replace(/(["\s'$`\\])/g, '\\$1') + '"';
};

let join = '; ';
if (process.platform === 'win32') {
    join = '&&';
}
let renderPath = path.join(__dirname, '../avatar-render-node/')
let wwwPath = path.join(__dirname, '../www/');
let decoded = JSON.parse(fs.readFileSync(confFile).toString());

const setupAvatarRender = () => {
    console.log('[avatar-render] [info] starting new process.');
    let ls = cp.spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'start'], {
        cwd: renderPath,
    });
    ls.stdout.on('data', function (data) {
        console.log('[avatar-render]: ' + data.toString());
    });

    ls.stderr.on('data', function (data) {
        console.error('[avatar-render]: ' + data.toString());
    });

    ls.on('error', function (e) {
        console.error(e);
    })
    ls.on('exit', function (code) {
        console.log('[avatar-render] child process exited with code ' + code.toString());
        setupAvatarRender();
    });
}

const setupWebServer = () => {
    console.log('[www] [info] starting new process.');
    let ls = cp.spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'start'], {
        cwd: wwwPath,
    });
    ls.stdout.on('data', function (data) {
        console.log('[www]: ' + data.toString());
    });

    ls.stderr.on('data', function (data) {
        console.error('[www]: ' + data.toString());
    });

    ls.on('error', function (e) {
        console.error(e);
    })
    ls.on('exit', function (code) {
        console.log('[www] child process exited with code ' + code.toString());
        setupWebServer();
    });
}


if (decoded.avatarRender.enabled) {
    setupAvatarRender();
}
setupWebServer();