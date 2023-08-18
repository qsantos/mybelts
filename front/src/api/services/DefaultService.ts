/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginInfo } from '../models/LoginInfo';
import type { LoginPost } from '../models/LoginPost';
import type { MissingI18nKeyEventList } from '../models/MissingI18nKeyEventList';
import type { MissingI18nKeyPost } from '../models/MissingI18nKeyPost';
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

    /**
     * @param xFields An optional fields mask
     * @returns MissingI18nKeyEventList Success
     * @throws ApiError
     */
    public static getMissingI18NKeyResource(
        xFields?: string,
    ): CancelablePromise<MissingI18nKeyEventList> {
        return __request({
            method: 'GET',
            path: `/missing-i18n-key`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param payload
     * @returns void
     * @throws ApiError
     */
    public static postMissingI18NKeyResource(
        payload: MissingI18nKeyPost,
    ): CancelablePromise<void> {
        return __request({
            method: 'POST',
            path: `/missing-i18n-key`,
            body: payload,
        });
    }

}