import React from 'react';
import { ReactElement } from 'react';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { formatDatetime, formatDatetimeRelative } from './lib';

export default function RelativeTime({ dateTime }: { dateTime: string }): ReactElement {
    return (
        <OverlayTrigger overlay={<Tooltip>{formatDatetime(dateTime)}</Tooltip>}>
            <time dateTime={dateTime}>
                {formatDatetimeRelative(dateTime)}
            </time>
        </OverlayTrigger>
    );
}
