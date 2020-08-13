import base from './base';

import * as avatarRenderHelper from '../helpers/AvatarRender';

/**
 * Avatar render service
 */
export default class AvatarRenderService extends base {
    /**
     * Get the avatar thumbnail URL for the {userId}
     * @param userId 
     */
    public getUserThumbnailUrl(userId: number): Promise<string> {
        return avatarRenderHelper.requestThumbnail(userId);
    }
}