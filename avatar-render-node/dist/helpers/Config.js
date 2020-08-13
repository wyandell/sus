"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conf = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '../../config.json')).toString());
exports.default = conf;
//# sourceMappingURL=Config.js.map