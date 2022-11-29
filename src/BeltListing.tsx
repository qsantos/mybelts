import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Table from 'react-bootstrap/Table';
import { AdminOnly } from './auth';

import { Belt } from './api';
import { BeltIcon } from './BeltIcon';
import { BeltMoveButton } from './BeltMoveButton';
import { BeltEditButton } from './BeltEditButton';
import { BeltDeleteButton } from './BeltDeleteButton';

interface Props {
    belts: Belt[];
    setBelts: (belts: Belt[]) => void;
    setErrorMessage: (errorMessage: string) => void;
}

export function BeltListing(props: Props): ReactElement {
    const { belts, setBelts, setErrorMessage } = props;
    const { t } = useTranslation();

    return (
        <>
            <Table>
                <thead>
                    <tr>
                        <th>{t('belt.list.rank.title')}</th>
                        <th>{t('belt.list.name.title')}</th>
                        <th>{t('belt.list.code.title')}</th>
                        <th>{t('belt.list.color.title')}</th>
                        <AdminOnly>
                            <th>{t('belt.list.actions.title')}</th>
                        </AdminOnly>
                    </tr>
                </thead>
                <tbody>
                    {belts.map((belt, index) => (
                        <tr key={belt.id}>
                            <td>{belt.rank}</td>
                            <td>{belt.name}</td>
                            <td>{belt.code}</td>
                            <td>
                                <BeltIcon belt={belt} />
                            </td>
                            <AdminOnly>
                                <td>
                                    <BeltMoveButton
                                        buttonContent="↑"
                                        direction_key="up"
                                        direction={-1}
                                        belt={belt}
                                        belts={belts}
                                        setBelts={setBelts}
                                        setErrorMessage={setErrorMessage}
                                    />{' '}
                                    <BeltMoveButton
                                        buttonContent="↓"
                                        direction_key="down"
                                        direction={1}
                                        belt={belt}
                                        belts={belts}
                                        setBelts={setBelts}
                                        setErrorMessage={setErrorMessage}
                                    />{' '}
                                    <BeltEditButton
                                        belt={belt}
                                        changedCallback={(new_belt) => {
                                            const new_belts = [...belts];
                                            new_belts[index] = new_belt;
                                            setBelts(new_belts);
                                        }}
                                    />{' '}
                                    <BeltDeleteButton
                                        belt={belt}
                                        deletedCallback={() => {
                                            const new_belts = [...belts];
                                            new_belts.splice(index, 1);
                                            for (
                                                let j = index;
                                                j < new_belts.length;
                                                j += 1
                                            ) {
                                                const other_belt = new_belts[j];
                                                if (other_belt !== undefined) {
                                                    // always true
                                                    other_belt.rank -= 1;
                                                }
                                            }
                                            setBelts(new_belts);
                                        }}
                                    />
                                </td>
                            </AdminOnly>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
}
