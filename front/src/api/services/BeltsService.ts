/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BeltList } from '../models/BeltList';
import type { BeltOne } from '../models/BeltOne';
import type { BeltPut } from '../models/BeltPut';
import type { BeltRank } from '../models/BeltRank';
import type { BeltsPost } from '../models/BeltsPost';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class BeltsService {

    /**
     * @param xFields An optional fields mask
     * @returns BeltList Success
     * @throws ApiError
     */
    public static getBeltsResource(
        xFields?: string,
    ): CancelablePromise<BeltList> {
        return __request({
            method: 'GET',
            path: `/belts`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns BeltOne Success
     * @throws ApiError
     */
    public static postBeltsResource(
        payload: BeltsPost,
        xFields?: string,
    ): CancelablePromise<BeltOne> {
        return __request({
            method: 'POST',
            path: `/belts`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param beltId
     * @returns void
     * @throws ApiError
     */
    public static deleteBeltResource(
        beltId: number,
    ): CancelablePromise<void> {
        return __request({
            method: 'DELETE',
            path: `/belts/${beltId}`,
        });
    }

    /**
     * @param beltId
     * @param payload
     * @param xFields An optional fields mask
     * @returns BeltOne Success
     * @throws ApiError
     */
    public static putBeltResource(
        beltId: number,
        payload: BeltPut,
        xFields?: string,
    ): CancelablePromise<BeltOne> {
        return __request({
            method: 'PUT',
            path: `/belts/${beltId}`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param beltId
     * @param payload
     * @param xFields An optional fields mask
     * @returns BeltOne Success
     * @throws ApiError
     */
    public static patchBeltRankResource(
        beltId: number,
        payload: BeltRank,
        xFields?: string,
    ): CancelablePromise<BeltOne> {
        return __request({
            method: 'PATCH',
            path: `/belts/${beltId}/rank`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

}