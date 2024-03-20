import React from 'react';
import { Dispatch, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';

import { Level } from './api';
import { AdminOnly } from './auth';
import LevelEditButton from './LevelEditButton';
import LevelDeleteButton from './LevelDeleteButton';

interface RowProps {
    level: Level;
    setLevels: Dispatch<(prevLevels: Level[]) => Level[]>;
}

function LevelRow_(props: RowProps) {
    const { level, setLevels } = props;

    const changedCallback = (nextLevel: Level) =>
        setLevels((prevLevels) => {
            const index = prevLevels.findIndex(
                (otherLevel) => otherLevel.id === nextLevel.id
            );
            if (index === null) {
                return prevLevels;
            }
            const nextLevels = [...prevLevels];
            nextLevels[index] = nextLevel;
            return nextLevels;
        });

    const deletedCallback = (level_id: number) =>
        setLevels((prevLevels) => {
            const index = prevLevels.findIndex(
                (otherLevel) => otherLevel.id === level_id
            );
            if (index === null) {
                return prevLevels;
            }
            const nextLevels = [...prevLevels];
            nextLevels.splice(index, 1);
            return nextLevels;
        });

    return (
        <tr key={level.id}>
            <td>
                <Nav.Link as={Link} to={'/levels/' + level.id}>
                    {level.name}
                </Nav.Link>
            </td>
            <AdminOnly>
                <td>
                    <LevelEditButton
                        level={level}
                        changedCallback={changedCallback}
                    />{' '}
                    <LevelDeleteButton
                        level={level}
                        deletedCallback={deletedCallback}
                    />
                </td>
            </AdminOnly>
        </tr>
    );
}

const LevelRow = React.memo(LevelRow_);

interface Props {
    levels: Level[];
    setLevels: Dispatch<(prevLevels: Level[]) => Level[]>;
}

export default function LevelListing(props: Props): ReactElement {
    const { levels, setLevels } = props;
    const { t } = useTranslation();
    return (
        <>
            <Table>
                <thead>
                    <tr>
                        <th>{t('level.list.name.title')}</th>
                        <AdminOnly>
                            <th>{t('level.list.actions.title')}</th>
                        </AdminOnly>
                    </tr>
                </thead>
                <tbody>
                    {levels.map((level) => (
                        <LevelRow
                            key={level.id}
                            level={level}
                            setLevels={setLevels}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    );
}
