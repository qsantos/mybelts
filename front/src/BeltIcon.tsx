import React from 'react';
import { ReactElement } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { ReactComponent as BeltImage } from './belt.svg';
import { Belt } from './api';

interface Props {
    belt: Belt;
    height?: number;
}

export default function BeltIcon(props: Props): ReactElement {
    const { belt, height } = props;
    return (
        <OverlayTrigger overlay={<Tooltip>{belt.name}</Tooltip>}>
            <BeltImage height={height || 40} fill={belt.color} />
        </OverlayTrigger>
    );
}
