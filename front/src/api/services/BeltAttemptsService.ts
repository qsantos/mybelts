/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BeltAttemptOne } from '../models/BeltAttemptOne';
import type { BeltAttemptPut } from '../models/BeltAttemptPut';
import type { BeltAttemptsPost } from '../models/BeltAttemptsPost';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class BeltAttemptsService {

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns BeltAttemptOne Success
     * @throws ApiError
     */
    public static postBeltAttemptsResource(
        payload: BeltAttemptsPost,
        xFields?: string,
    ): CancelablePromise<BeltAttemptOne> {
        return __request({
            method: 'POST',
            path: `/belt-attempts`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param beltAttemptId
     * @returns any Success
     * @throws ApiError
     */
    public static deleteBeltAttemptResource(
        beltAttemptId: number,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/belt-attempts/${beltAttemptId}`,
        });
    }

    /**
     * @param beltAttemptId
     * @param xFields An optional fields mask
     * @returns BeltAttemptOne Success
     * @throws ApiError
     */
    public static getBeltAttemptResource(
        beltAttemptId: number,
        xFields?: string,
    ): CancelablePromise<BeltAttemptOne> {
        return __request({
            method: 'GET',
            path: `/belt-attempts/${beltAttemptId}`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param beltAttemptId
     * @param payload
     * @param xFields An optional fields mask
     * @returns BeltAttemptOne Success
     * @throws ApiError
     */
    public static putBeltAttemptResource(
        beltAttemptId: number,
        payload: BeltAttemptPut,
        xFields?: string,
    ): CancelablePromise<BeltAttemptOne> {
        return __request({
            method: 'PUT',
            path: `/belt-attempts/${beltAttemptId}`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

}