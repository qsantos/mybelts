/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SkillDomainList } from '../models/SkillDomainList';
import type { SkillDomainOne } from '../models/SkillDomainOne';
import type { SkillDomainPut } from '../models/SkillDomainPut';
import type { SKillDomainsPost } from '../models/SKillDomainsPost';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class SkillDomainsService {

    /**
     * @param xFields An optional fields mask
     * @returns SkillDomainList Success
     * @throws ApiError
     */
    public static getSkillDomainsResource(
        xFields?: string,
    ): CancelablePromise<SkillDomainList> {
        return __request({
            method: 'GET',
            path: `/skill-domains`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns SkillDomainOne Success
     * @throws ApiError
     */
    public static postSkillDomainsResource(
        payload: SKillDomainsPost,
        xFields?: string,
    ): CancelablePromise<SkillDomainOne> {
        return __request({
            method: 'POST',
            path: `/skill-domains`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param skillDomainId
     * @returns any Success
     * @throws ApiError
     */
    public static deleteSkillDomainResource(
        skillDomainId: number,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/skill-domains/${skillDomainId}/`,
        });
    }

    /**
     * @param skillDomainId
     * @param xFields An optional fields mask
     * @returns SkillDomainOne Success
     * @throws ApiError
     */
    public static getSkillDomainResource(
        skillDomainId: number,
        xFields?: string,
    ): CancelablePromise<SkillDomainOne> {
        return __request({
            method: 'GET',
            path: `/skill-domains/${skillDomainId}/`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param skillDomainId
     * @param payload
     * @param xFields An optional fields mask
     * @returns SkillDomainOne Success
     * @throws ApiError
     */
    public static putSkillDomainResource(
        skillDomainId: number,
        payload: SkillDomainPut,
        xFields?: string,
    ): CancelablePromise<SkillDomainOne> {
        return __request({
            method: 'PUT',
            path: `/skill-domains/${skillDomainId}/`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

}