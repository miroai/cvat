// Copyright (C) 2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { CombinedState } from 'reducers';
import Text from 'antd/lib/typography/Text';
import Modal from 'antd/lib/modal';

import config from 'config';
import { removeObjectAsync, removeObject as removeObjectAction } from 'actions/annotation-actions';
import { ObjectType } from 'cvat-core-wrapper';

export default function RemoveConfirmComponent(): JSX.Element | null {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState<string | JSX.Element>('');
    const { objectState, force } = useSelector((state: CombinedState) => ({
        objectState: state.annotation.remove.objectState,
        force: state.annotation.remove.force,
    }), shallowEqual);

    const onOk = useCallback(() => {
        dispatch(removeObjectAsync(objectState, true));
    }, [objectState]);

    const onCancel = useCallback(() => {
        dispatch(removeObjectAction(null, false));
    }, []);

    useEffect(() => {
        const newVisible = (!!objectState && !force && objectState.lock) ||
            (objectState?.objectType === ObjectType.TRACK && !force);
        setTitle(objectState?.lock ? 'Object is locked' : 'Remove object');
        let descriptionMessage: string | JSX.Element = 'Are you sure you want to remove it?';

        if (objectState?.objectType === ObjectType.TRACK && !force) {
            descriptionMessage = (
                <>
                    <Text>
                        {
                            `The object you are trying to remove is a track.
                            If you continue, it removes many drawn objects on different frames.
                            If you want to hide it only on this frame, use the outside feature instead.
                            ${descriptionMessage}`
                        }
                    </Text>
                    <div className='cvat-remove-object-confirm-wrapper'>
                        {/* eslint-disable-next-line */}
                        <img src={config.OUTSIDE_PIC_URL} />
                    </div>
                </>
            );
        }

        setDescription(descriptionMessage);
        setVisible(newVisible);
        if (!newVisible && objectState) {
            dispatch(removeObjectAsync(objectState, true));
        }
    }, [objectState, force]);

    return (
        <Modal
            okType='primary'
            okText='Yes'
            cancelText='Cancel'
            title={title}
            open={visible}
            cancelButtonProps={{
                autoFocus: true,
            }}
            onOk={onOk}
            onCancel={onCancel}
            destroyOnClose
            className='cvat-modal-confirm-remove-object'
        >
            <div>
                {description}
            </div>
        </Modal>
    );
}
