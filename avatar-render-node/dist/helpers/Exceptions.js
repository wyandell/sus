"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPExceptions = require("ts-httpexceptions");
class StdExceptions {
    constructor() {
        this.NotFound = HTTPExceptions.NotFound;
        this.BadRequest = HTTPExceptions.BadRequest;
        this.InternalServerError = HTTPExceptions.InternalServerError;
    }
}
exports.default = StdExceptions;
//# sourceMappingURL=Exceptions.js.map