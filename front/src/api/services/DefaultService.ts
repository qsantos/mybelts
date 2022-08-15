/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginInfo } from '../models/LoginInfo';
import type { LoginPost } from '../models/LoginPost';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns LoginInfo Success
     * @throws ApiError
     */
    public static postLoginResource(
        payload: LoginPost,
        xFields?: string,
    ): CancelablePromise<LoginInfo> {
        return __request({
            method: 'POST',
            path: `/login`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

}