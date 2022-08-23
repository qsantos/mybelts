/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClassLevelList } from '../models/ClassLevelList';
import type { ClassLevelOne } from '../models/ClassLevelOne';
import type { ClassLevelPut } from '../models/ClassLevelPut';
import type { ClassLevelsPost } from '../models/ClassLevelsPost';
import type { ExamOne } from '../models/ExamOne';
import type { SchoolClassList } from '../models/SchoolClassList';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ClassLevelsService {

    /**
     * @param xFields An optional fields mask
     * @returns ClassLevelList Success
     * @throws ApiError
     */
    public static getClassLevelsResource(
        xFields?: string,
    ): CancelablePromise<ClassLevelList> {
        return __request({
            method: 'GET',
            path: `/class-levels`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns ClassLevelOne Success
     * @throws ApiError
     */
    public static postClassLevelsResource(
        payload: ClassLevelsPost,
        xFields?: string,
    ): CancelablePromise<ClassLevelOne> {
        return __request({
            method: 'POST',
            path: `/class-levels`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param classLevelId
     * @returns void
     * @throws ApiError
     */
    public static deleteClassLevelResource(
        classLevelId: number,
    ): CancelablePromise<void> {
        return __request({
            method: 'DELETE',
            path: `/class-levels/${classLevelId}`,
        });
    }

    /**
     * @param classLevelId
     * @param xFields An optional fields mask
     * @returns SchoolClassList Success
     * @throws ApiError
     */
    public static getClassLevelResource(
        classLevelId: number,
        xFields?: string,
    ): CancelablePromise<SchoolClassList> {
        return __request({
            method: 'GET',
            path: `/class-levels/${classLevelId}`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param classLevelId
     * @param payload
     * @param xFields An optional fields mask
     * @returns ClassLevelOne Success
     * @throws ApiError
     */
    public static putClassLevelResource(
        classLevelId: number,
        payload: ClassLevelPut,
        xFields?: string,
    ): CancelablePromise<ClassLevelOne> {
        return __request({
            method: 'PUT',
            path: `/class-levels/${classLevelId}`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param classLevelId
     * @param skillDomainId
     * @param beltId
     * @param file
     * @param xFields An optional fields mask
     * @returns ExamOne Success
     * @throws ApiError
     */
    public static postClassLevelExamsResource(
        classLevelId: number,
        skillDomainId: number,
        beltId: number,
        file: Blob,
        xFields?: string,
    ): CancelablePromise<ExamOne> {
        return __request({
            method: 'POST',
            path: `/class-levels/${classLevelId}/exams`,
            headers: {
                'X-Fields': xFields,
            },
            formData: {
                'skill_domain_id': skillDomainId,
                'belt_id': beltId,
                'file': file,
            },
        });
    }

}