/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EvaluationOne } from '../models/EvaluationOne';
import type { EvaluationPut } from '../models/EvaluationPut';
import type { EvaluationsPost } from '../models/EvaluationsPost';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class EvaluationsService {

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns EvaluationOne Success
     * @throws ApiError
     */
    public static postEvaluationsResource(
        payload: EvaluationsPost,
        xFields?: string,
    ): CancelablePromise<EvaluationOne> {
        return __request({
            method: 'POST',
            path: `/evaluations`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param evaluationId
     * @returns void
     * @throws ApiError
     */
    public static deleteEvaluationResource(
        evaluationId: number,
    ): CancelablePromise<void> {
        return __request({
            method: 'DELETE',
            path: `/evaluations/${evaluationId}`,
        });
    }

    /**
     * @param evaluationId
     * @param payload
     * @param xFields An optional fields mask
     * @returns EvaluationOne Success
     * @throws ApiError
     */
    public static putEvaluationResource(
        evaluationId: number,
        payload: EvaluationPut,
        xFields?: string,
    ): CancelablePromise<EvaluationOne> {
        return __request({
            method: 'PUT',
            path: `/evaluations/${evaluationId}`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

}