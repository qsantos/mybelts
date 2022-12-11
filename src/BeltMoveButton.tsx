import React from 'react';
import { Dispatch, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';

import { Belt, BeltsService } from './api';
import { getAPIError } from './lib';

interface Props {
    buttonContent: string;
    direction_key: string;
    direction: number;
    belt: Belt;
    belts: Belt[];
    setBelts: Dispatch<(prevBelts: Belt[]) => Belt[]>;
    setErrorMessage: Dispatch<string>;
}

export default function BeltMoveButton(props: Props): ReactElement {
    const {
        buttonContent,
        direction_key,
        direction,
        belt,
        belts,
        setBelts,
        setErrorMessage,
    } = props;
    const { t } = useTranslation();
    const [moving, setMoving] = useState(false);

    function handleMove() {
        setMoving(true);
        setErrorMessage('');
        BeltsService.patchBeltRankResource(belt.id, {
            increase_by: direction,
        })
            .then(() =>
                setBelts((prevBelts) => {
                    setMoving(false);
                    const nextBelts = [...prevBelts];
                    const other_belt = nextBelts[belt.rank + direction - 1];
                    if (other_belt === undefined) {
                        console.error('Failed to find other belt');
                        return nextBelts;
                    }
                    // adjust belt list
                    [belt.rank, other_belt.rank] = [other_belt.rank, belt.rank];
                    nextBelts[belt.rank - 1] = belt;
                    nextBelts[other_belt.rank - 1] = other_belt;
                    return nextBelts;
                })
            )
            .catch((error) => {
                setMoving(false);
                setErrorMessage(getAPIError(error));
            });
    }

    return (
        <>
            <OverlayTrigger
                overlay={
                    <Tooltip>
                        {t('belt.move.' + direction_key + '.title')}
                    </Tooltip>
                }
            >
                {moving ? (
                    <Button disabled>
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">
                                {t('belt.move.' + direction_key + '.title')}
                            </span>
                        </Spinner>
                    </Button>
                ) : (
                    <Button
                        disabled={
                            belt.rank + direction <= 0 ||
                            belt.rank + direction > belts.length
                        }
                        onClick={handleMove}
                    >
                        {buttonContent}
                    </Button>
                )}
            </OverlayTrigger>
        </>
    );
}
