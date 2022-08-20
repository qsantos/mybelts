import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';

import { ClassLevel, ClassLevelsService } from './api';
import { AdminOnly } from './auth';
import { ModalButton } from './modal-button';

interface CreateClassLevelButtonProps {
    createdCallback?: (class_level: ClassLevel) => void;
}

export function CreateClassLevelButton(props : CreateClassLevelButtonProps): ReactElement {
    const { createdCallback } = props;
    const { t } = useTranslation();

    return(
        <ModalButton
            i18nPrefix="class_level.add"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    prefix: {value: string};
                };
                return ClassLevelsService.postClassLevelsResource({
                    prefix: typed_form.prefix.value,
                });
            }}
            onResponse={({ class_level }) => createdCallback?.(class_level)}
        >
            <Form.Group controlId="prefix">
                <Form.Label>{t('class_level.add_edit.prefix.title')}</Form.Label>
                <Form.Control type="text" placeholder={t('class_level.add_edit.prefix.placeholder')}/>
                <Form.Text className="text-muted">
                    {t('class_level.add_edit.prefix.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}

interface EditClassLevelButtonProps {
    class_level: ClassLevel;
    changedCallback?: (changed_class_level: ClassLevel) => void;
}

export function EditClassLevelButton(props : EditClassLevelButtonProps): ReactElement {
    const { class_level, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="class_level.edit"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    prefix: {value: string};
                };
                return ClassLevelsService.putClassLevelResource(class_level.id, {
                    prefix: typed_form.prefix.value,
                });
            }}
            onResponse={({ class_level: changed_class_level }) => changedCallback?.(changed_class_level)}
        >
            <Form.Group controlId="prefix">
                <Form.Label>{t('class_level.add_edit.prefix.title')}</Form.Label>
                <Form.Control type="text" placeholder={t('class_level.add_edit.prefix.placeholder')} defaultValue={class_level.prefix} />
                <Form.Text className="text-muted">
                    {t('class_level.add_edit.prefix.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}

interface DeleteClassLevelButtonProps {
    class_level: ClassLevel;
    deletedCallback?: () => void;
}

export function DeleteClassLevelButton(props : DeleteClassLevelButtonProps): ReactElement {
    const { class_level, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="class_level.delete"
            onSubmit={() => ClassLevelsService.deleteClassLevelResource(class_level.id)}
            onResponse={() => deletedCallback?.()}
        >
            {t('class_level.delete.message')}
        </ModalButton>
    );
}

interface ClassLevelListingProps {
    class_levels: ClassLevel[];
    setClassLevels: (class_levels: ClassLevel[]) => void;
}

export function ClassLevelListing(props: ClassLevelListingProps): ReactElement {
    const { class_levels, setClassLevels } = props;
    const { t } = useTranslation();
    return <>
        <Table>
            <thead>
                <tr>
                    <th>{t('class_level.list.prefix.title')}</th>
                    <AdminOnly>
                        <th>{t('class_level.list.actions.title')}</th>
                    </AdminOnly>
                </tr>
            </thead>
            <tbody>
                {class_levels.map((class_level, index) =>
                    <tr key={class_level.id}>
                        <td>
                            <Nav.Link as={Link} to={'/class-levels/' + class_level.id}>
                                {class_level.prefix}
                            </Nav.Link>
                        </td>
                        <AdminOnly>
                            <td>
                                <EditClassLevelButton class_level={class_level} changedCallback={new_class_level => {
                                    const new_class_levels = [...class_levels];
                                    new_class_levels[index] = new_class_level;
                                    setClassLevels(new_class_levels);
                                }} />
                                {' '}
                                <DeleteClassLevelButton class_level={class_level} deletedCallback={() => {
                                    const new_class_levels = [...class_levels];
                                    new_class_levels.splice(index, 1);
                                    setClassLevels(new_class_levels);
                                }} />
                            </td>
                        </AdminOnly>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}
