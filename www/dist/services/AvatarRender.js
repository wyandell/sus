"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const avatarRenderHelper = require("../helpers/AvatarRender");
/**
 * Avatar render service
 */
class AvatarRenderService extends base_1.default {
    /**
     * Get the avatar thumbnail URL for the {userId}
     * @param userId
     */
    getUserThumbnailUrl(userId) {
        return avatarRenderHelper.requestThumbnail(userId);
    }
}
exports.default = AvatarRenderService;
//# sourceMappingURL=AvatarRender.js.map