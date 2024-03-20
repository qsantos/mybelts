/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamOne } from '../models/ExamOne';
import type { LevelList } from '../models/LevelList';
import type { LevelOne } from '../models/LevelOne';
import type { LevelPut } from '../models/LevelPut';
import type { LevelsPost } from '../models/LevelsPost';
import type { SchoolClassList } from '../models/SchoolClassList';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class LevelsService {

    /**
     * @param xFields An optional fields mask
     * @returns LevelList Success
     * @throws ApiError
     */
    public static getLevelsResource(
        xFields?: string,
    ): CancelablePromise<LevelList> {
        return __request({
            method: 'GET',
            path: `/levels`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns LevelOne Success
     * @throws ApiError
     */
    public static postLevelsResource(
        payload: LevelsPost,
        xFields?: string,
    ): CancelablePromise<LevelOne> {
        return __request({
            method: 'POST',
            path: `/levels`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param levelId
     * @returns void
     * @throws ApiError
     */
    public static deleteLevelResource(
        levelId: number,
    ): CancelablePromise<void> {
        return __request({
            method: 'DELETE',
            path: `/levels/${levelId}`,
        });
    }

    /**
     * @param levelId
     * @param xFields An optional fields mask
     * @returns SchoolClassList Success
     * @throws ApiError
     */
    public static getLevelResource(
        levelId: number,
        xFields?: string,
    ): CancelablePromise<SchoolClassList> {
        return __request({
            method: 'GET',
            path: `/levels/${levelId}`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param levelId
     * @param payload
     * @param xFields An optional fields mask
     * @returns LevelOne Success
     * @throws ApiError
     */
    public static putLevelResource(
        levelId: number,
        payload: LevelPut,
        xFields?: string,
    ): CancelablePromise<LevelOne> {
        return __request({
            method: 'PUT',
            path: `/levels/${levelId}`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param levelId
     * @param skillDomainId
     * @param beltId
     * @param code
     * @param filename
     * @param file
     * @param xFields An optional fields mask
     * @returns ExamOne Success
     * @throws ApiError
     */
    public static postLevelExamsResource(
        levelId: number,
        skillDomainId: number,
        beltId: number,
        code: string,
        filename: string,
        file: Blob,
        xFields?: string,
    ): CancelablePromise<ExamOne> {
        return __request({
            method: 'POST',
            path: `/levels/${levelId}/exams`,
            headers: {
                'X-Fields': xFields,
            },
            formData: {
                'skill_domain_id': skillDomainId,
                'belt_id': beltId,
                'code': code,
                'filename': filename,
                'file': file,
            },
        });
    }

}