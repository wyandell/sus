import { Controller, Get, QueryParams, Res, PathParams, Required } from '@tsed/common';
import { Summary } from '@tsed/swagger'
import * as _ from 'lodash';
import base from '../base';

@Controller('/users')
export class UsersController extends base {

    @Get('/:userId/profile-info')
    public async scrapeProfileInfo(
        @PathParams('userId', Number) userId: number,
    ) {
        const profile = await this.Users.getUserProfileHtml(userId);
        let data = this.Users.processUserProfileHtml(profile);
        return data;
    }

    @Get('/:userId/friends')
    @Summary('Get user friends')
    public async getFriends(
        @Required()
        @PathParams('userId', Number) userId: number,
        @QueryParams('mode', String) mode?: string,
    ) {
        return this.Friends.getFriends(userId).then(val => {
            if (mode === 'profile') {
                return {
                    total: val.length,
                    data: _.chunk(_.chunk(val, 6), 4)
                };
            }
            return {
                total: val.length,
                data: val,
            };
        })
    }
}