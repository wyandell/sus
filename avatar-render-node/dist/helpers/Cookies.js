"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
let cookies = fs_1.readFileSync(path_1.join(__dirname, '../../../cookies.txt')).toString().replace(/\r/g, '').split('\n').filter(val => {
    return !!val;
});
let index = 0;
let reserved = [];
exports.get = () => {
    let val = cookies[index];
    if (typeof val !== 'string' || !val) {
        index = 0;
        val = cookies[0];
    }
    index++;
    if (reserved.includes(val)) {
        return exports.get();
    }
    reserved.push(val);
    return {
        cookie: val,
        done: () => {
            reserved = reserved.filter(bad => {
                return bad !== val;
            });
        }
    };
};
exports.bad = (badCookie) => {
    cookies = cookies.filter(val => {
        return val !== badCookie;
    });
};
//# sourceMappingURL=Cookies.js.map