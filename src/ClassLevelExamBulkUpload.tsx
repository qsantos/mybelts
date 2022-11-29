import React from 'react';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';

import { Belt, ClassLevel, Exam, SkillDomain, ClassLevelsService } from './api';
import { getAPIError } from './lib';

interface Props {
    belts: Belt[];
    skill_domains: SkillDomain[];
    class_level: ClassLevel;
    createdCallback: (new_exam: Exam) => void;
}

export default function ClassLevelExamBulkUpload(props: Props): ReactElement {
    const { belts, skill_domains, class_level, createdCallback } = props;
    const { t } = useTranslation();

    const [files, setFiles] = useState<{ file: File; uploading: boolean }[]>(
        []
    );
    const [errorMessage, setErrorMessage] = useState('');

    const skill_domain_options = skill_domains.map((skill_domain) => ({
        value: skill_domain.id,
        label: skill_domain.name,
    }));
    const belt_options = belts.map((belt) => ({
        value: belt.id,
        label: belt.name,
    }));

    function dropHandler(event: React.DragEvent<HTMLDivElement>) {
        setFiles((old_files) => {
            const new_files = [...old_files];
            for (const file of event.dataTransfer.files) {
                new_files.push({ file, uploading: false });
            }
            return new_files;
        });
        event.preventDefault();
    }

    function dragOverHandler(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    function setUploading(file: File, uploading: boolean) {
        setFiles((old_files) => {
            const new_files = [...old_files];
            const new_index = new_files.findIndex((x) => x.file === file);
            const new_file = old_files[new_index];
            if (new_file) {
                new_file.uploading = uploading;
            }
            return new_files;
        });
    }

    function removeFile(file: File) {
        setFiles((old_files) => {
            const new_files = [...old_files];
            const new_index = new_files.findIndex((x) => x.file === file);
            new_files.splice(new_index, 1);
            return new_files;
        });
    }

    function uploadFile(index: number) {
        const file = files[index]?.file;
        const skill_domain_id = document.querySelectorAll<HTMLInputElement>(
            '#bulk-upload [name=skill_domain]'
        )[index]?.value;
        const belt_id = document.querySelectorAll<HTMLInputElement>(
            '#bulk-upload [name=belt]'
        )[index]?.value;
        const exam_code = document.querySelectorAll<HTMLInputElement>(
            '#bulk-upload [name=exam_code]'
        )[index]?.value;
        if (!file || !skill_domain_id || !belt_id || !exam_code) {
            return;
        }
        file.arrayBuffer()
            .then((data) =>
                ClassLevelsService.postClassLevelExamsResource(
                    class_level.id,
                    parseInt(skill_domain_id),
                    parseInt(belt_id),
                    exam_code,
                    file.name,
                    new Blob([data])
                )
                    .then(({ exam }) => {
                        removeFile(file);
                        createdCallback(exam);
                    })
                    .catch((error) => {
                        setUploading(file, false);
                        setErrorMessage(getAPIError(error));
                    })
            )
            .catch((error) => {
                setUploading(file, false);
                setErrorMessage(getAPIError(error));
            });
        setUploading(file, true);
        setErrorMessage('');
    }

    function uploadAll() {
        for (let index = 0; index < files.length; index += 1) {
            uploadFile(index);
        }
    }

    const allUploading = files.reduce(
        (previous, { uploading }) => previous && uploading,
        true
    );

    const filename_pattern = /^(.*?)-eval_ceinture-(.*?)_s(.*?)-eleve/i;

    return (
        <>
            {errorMessage && (
                <Alert variant="danger">
                    {t('error')}: {errorMessage}
                </Alert>
            )}
            {files.length !== 0 && (
                <Table id="bulk-upload">
                    <thead>
                        <tr>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th style={{ width: '100px' }}>
                                <Button onClick={() => setFiles([])}>❌</Button>
                                {allUploading ? (
                                    <Button disabled>
                                        <Spinner
                                            animation="border"
                                            role="status"
                                            size="sm"
                                        >
                                            <span className="visually-hidden">
                                                ⟳
                                            </span>
                                        </Spinner>
                                    </Button>
                                ) : (
                                    <Button onClick={() => uploadAll()}>
                                        ✅
                                    </Button>
                                )}
                            </th>
                        </tr>
                        <tr>
                            <th>{t('exam.bulk_upload.filename.title')}</th>
                            <th>{t('exam.bulk_upload.skill_domain.title')}</th>
                            <th>{t('exam.bulk_upload.belt.title')}</th>
                            <th>{t('exam.bulk_upload.exam_code.title')}</th>
                            <th>{t('exam.bulk_upload.actions.title')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map(({ file, uploading }, index) => {
                            const match = file.name
                                .toLowerCase()
                                .match(filename_pattern);
                            let skill_domain;
                            let belt;
                            let exam_code;
                            if (match) {
                                const [
                                    ,
                                    skill_domain_code,
                                    belt_code,
                                    exam_code_match,
                                ] = match;
                                skill_domain = skill_domains.find(
                                    (x) =>
                                        x.code.toLowerCase() ===
                                        skill_domain_code
                                );
                                belt = belts.find(
                                    (x) => x.code.toLowerCase() === belt_code
                                );
                                exam_code = exam_code_match?.toUpperCase();
                            }
                            return (
                                <tr key={file.name}>
                                    <th>{file.name}</th>
                                    <td>
                                        <Select
                                            id="skill_domain"
                                            name="skill_domain"
                                            options={skill_domain_options}
                                            defaultValue={
                                                skill_domain && {
                                                    value: skill_domain.id,
                                                    label: skill_domain.name,
                                                }
                                            }
                                        />
                                    </td>
                                    <td>
                                        <Select
                                            id="belt"
                                            name="belt"
                                            options={belt_options}
                                            defaultValue={
                                                belt && {
                                                    value: belt.id,
                                                    label: belt.name,
                                                }
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="exam_code"
                                            className="form-control"
                                            defaultValue={exam_code}
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            onClick={() => removeFile(file)}
                                        >
                                            ❌
                                        </Button>
                                        {uploading ? (
                                            <Button disabled>
                                                <Spinner
                                                    animation="border"
                                                    role="status"
                                                    size="sm"
                                                >
                                                    <span className="visually-hidden">
                                                        ⟳
                                                    </span>
                                                </Spinner>
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() =>
                                                    uploadFile(index)
                                                }
                                            >
                                                ✅
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}
            <div
                onDrop={dropHandler}
                onDragOver={dragOverHandler}
                style={{
                    border: '5px dashed grey',
                    borderRadius: '10px',
                    textAlign: 'center',
                    padding: '2em',
                    margin: '2em',
                    fontFamily: 'sans',
                }}
            >
                <img
                    src="/upload.svg"
                    height="80"
                    alt={t('exam.bulk_upload.image.alt')}
                />
                <br />
                {t('exam.bulk_upload.prompt')}
            </div>
        </>
    );
}
