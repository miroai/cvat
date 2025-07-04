// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons/lib/icons';
import Text from 'antd/lib/typography/Text';
import InputNumber from 'antd/lib/input-number';
import { Col, Row } from 'antd/lib/grid';
import Divider from 'antd/lib/divider';
import Form, { FormInstance } from 'antd/lib/form';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import Select from 'antd/lib/select';
import CVATTooltip from 'components/common/cvat-tooltip';
import { QualitySettings, TargetMetric } from 'cvat-core-wrapper';
import { PointSizeBase } from 'cvat-core/src/quality-settings';
import { defaultVisibility, ResourceFilterHOC } from 'components/resource-sorting-filtering';
import {
    localStorageRecentKeyword, localStorageRecentCapacity, config,
} from './jobs-filter-configuration';

interface Props {
    form: FormInstance;
    settings: QualitySettings;
    disabled: boolean;
    onSave: () => void;
}

const FilteringComponent = ResourceFilterHOC(
    config, localStorageRecentKeyword, localStorageRecentCapacity,
);

export default function QualitySettingsForm(props: Readonly<Props>): JSX.Element | null {
    const { form, settings, disabled } = props;

    const [visibility, setVisibility] = useState(defaultVisibility);

    const initialValues = {
        targetMetric: settings.targetMetric,
        targetMetricThreshold: settings.targetMetricThreshold * 100,

        maxValidationsPerJob: settings.maxValidationsPerJob,

        lowOverlapThreshold: settings.lowOverlapThreshold * 100,
        iouThreshold: settings.iouThreshold * 100,
        compareAttributes: settings.compareAttributes,
        emptyIsAnnotated: settings.emptyIsAnnotated,

        oksSigma: settings.oksSigma * 100,
        pointSizeBase: settings.pointSizeBase,

        lineThickness: settings.lineThickness * 100,
        lineOrientationThreshold: settings.lineOrientationThreshold * 100,
        compareLineOrientation: settings.compareLineOrientation,

        compareGroups: settings.compareGroups,
        groupMatchThreshold: settings.groupMatchThreshold * 100,

        checkCoveredAnnotations: settings.checkCoveredAnnotations,
        objectVisibilityThreshold: settings.objectVisibilityThreshold * 100,
        panopticComparison: settings.panopticComparison,

        jobFilter: settings.jobFilter,
    };

    const targetMetricDescription = `${settings.descriptions.targetMetric
        .replaceAll(/\* [a-z` -]+[A-Z]+/g, '')
        .replaceAll(/\n/g, '')
    }`;

    const pointSizeBaseDescription = `${settings.descriptions.pointSizeBase
        .substring(0, settings.descriptions.pointSizeBase.indexOf('\n\n\n'))
        .replaceAll(/\n/g, ' ')
    }`;

    const makeTooltipFragment = (metric: string, description: string): JSX.Element => (
        <div>
            <Text strong>{`${metric}:`}</Text>
            <Text>
                {description}
            </Text>
        </div>
    );

    const makeTooltip = (jsx: JSX.Element): JSX.Element => (
        <div className='cvat-settings-tooltip-inner'>
            {jsx}
        </div>
    );

    const generalTooltip = makeTooltip(
        <>
            {makeTooltipFragment('Target metric', targetMetricDescription)}
            {makeTooltipFragment('Target metric threshold', settings.descriptions.targetMetricThreshold)}
            {makeTooltipFragment('Compare attributes', settings.descriptions.compareAttributes)}
            {makeTooltipFragment('Empty frames are annotated', settings.descriptions.emptyIsAnnotated)}
            {makeTooltipFragment('Job selection filter', settings.descriptions.jobFilter)}
        </>,
    );

    const jobValidationTooltip = makeTooltip(
        makeTooltipFragment('Max validations per job', settings.descriptions.maxValidationsPerJob),
    );

    const shapeComparisonTooltip = makeTooltip(
        <>
            {makeTooltipFragment('Min overlap threshold (IoU)', settings.descriptions.iouThreshold)}
            {makeTooltipFragment('Low overlap threshold', settings.descriptions.lowOverlapThreshold)}
        </>,
    );

    const keypointTooltip = makeTooltip(
        makeTooltipFragment('Object Keypoint Similarity (OKS)', settings.descriptions.oksSigma),
    );

    const pointTooltip = makeTooltip(
        makeTooltipFragment('Point size base', pointSizeBaseDescription),
    );

    const linesTooltip = makeTooltip(
        <>
            {makeTooltipFragment('Line thickness', settings.descriptions.lineThickness)}
            {makeTooltipFragment('Check orientation', settings.descriptions.compareLineOrientation)}
            {makeTooltipFragment('Min similarity gain', settings.descriptions.lineOrientationThreshold)}
        </>,
    );

    const groupTooltip = makeTooltip(
        <>
            {makeTooltipFragment('Compare groups', settings.descriptions.compareGroups)}
            {makeTooltipFragment('Min group match threshold', settings.descriptions.groupMatchThreshold)}
        </>,
    );

    const segmentationTooltip = makeTooltip(
        <>
            {makeTooltipFragment('Check object visibility', settings.descriptions.checkCoveredAnnotations)}
            {makeTooltipFragment('Min visibility threshold', settings.descriptions.objectVisibilityThreshold)}
            {makeTooltipFragment('Match only visible parts', settings.descriptions.panopticComparison)}
        </>,
    );

    return (
        <Form
            form={form}
            layout='vertical'
            className={`cvat-quality-settings-form ${disabled ? 'cvat-quality-settings-form-disabled' : ''}`}
            initialValues={initialValues}
            disabled={disabled}
        >
            <Row className='cvat-quality-settings-title'>
                <Text strong>
                    General
                </Text>
                <CVATTooltip title={generalTooltip} className='cvat-settings-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                    <QuestionCircleOutlined
                        style={{ opacity: 0.5 }}
                    />
                </CVATTooltip>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='targetMetric'
                        label='Target metric'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <Select
                            style={{ width: '70%' }}
                            virtual={false}
                        >
                            <Select.Option value={TargetMetric.ACCURACY}>
                                Accuracy
                            </Select.Option>
                            <Select.Option value={TargetMetric.PRECISION}>
                                Precision
                            </Select.Option>
                            <Select.Option value={TargetMetric.RECALL}>
                                Recall
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name='targetMetricThreshold'
                        label='Target metric threshold'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <InputNumber min={0} max={100} precision={0} />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='compareAttributes'
                        valuePropName='checked'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <Checkbox>
                            <Text className='cvat-text-color'>Compare attributes</Text>
                        </Checkbox>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name='emptyIsAnnotated'
                        valuePropName='checked'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <Checkbox>
                            <Text className='cvat-text-color'>Empty frames are annotated</Text>
                        </Checkbox>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='jobFilter'
                        label='Job selection filter'
                        trigger='onApplyFilter'
                    >
                        {/* value and onApplyFilter will be automatically provided by Form.Item */}
                        <FilteringComponent
                            predefinedVisible={visibility.predefined}
                            builderVisible={visibility.builder}
                            recentVisible={visibility.recent}
                            onPredefinedVisibleChange={(visible: boolean) => (
                                setVisibility({ ...defaultVisibility, predefined: visible })
                            )}
                            onBuilderVisibleChange={(visible: boolean) => (
                                setVisibility({ ...defaultVisibility, builder: visible })
                            )}
                            onRecentVisibleChange={(visible: boolean) => (
                                setVisibility({ ...defaultVisibility, builder: visibility.builder, recent: visible })
                            )}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Divider />
            <Row className='cvat-quality-settings-title'>
                <Text strong>
                    Job validation
                </Text>
                <CVATTooltip title={jobValidationTooltip} className='cvat-settings-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                    <QuestionCircleOutlined
                        style={{ opacity: 0.5 }}
                    />
                </CVATTooltip>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='maxValidationsPerJob'
                        label='Max validations per job'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            precision={0}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Divider />
            <Row className='cvat-quality-settings-title'>
                <Text strong>
                    Shape comparison
                </Text>
                <CVATTooltip title={shapeComparisonTooltip} className='cvat-settings-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                    <QuestionCircleOutlined
                        style={{ opacity: 0.5 }}
                    />
                </CVATTooltip>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='iouThreshold'
                        label='Min overlap threshold (%)'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <InputNumber min={0} max={100} precision={0} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name='lowOverlapThreshold'
                        label='Low overlap threshold (%)'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <InputNumber min={0} max={100} precision={0} />
                    </Form.Item>
                </Col>
            </Row>
            <Divider />
            <Row className='cvat-quality-settings-title'>
                <Text strong>
                    Keypoint Comparison
                </Text>
                <CVATTooltip title={keypointTooltip} className='cvat-settings-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                    <QuestionCircleOutlined
                        style={{ opacity: 0.5 }}
                    />
                </CVATTooltip>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='oksSigma'
                        label='OKS sigma (bbox side %)'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <InputNumber min={0} max={100} precision={0} />
                    </Form.Item>
                </Col>
            </Row>
            <Divider />
            <Row className='cvat-quality-settings-title'>
                <Text strong>
                    Point Comparison
                </Text>
                <CVATTooltip title={pointTooltip} className='cvat-settings-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                    <QuestionCircleOutlined
                        style={{ opacity: 0.5 }}
                    />
                </CVATTooltip>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='pointSizeBase'
                        label='Point size base'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <Select
                            style={{ width: '70%' }}
                            virtual={false}
                        >
                            <Select.Option value={PointSizeBase.IMAGE_SIZE}>
                                Image size
                            </Select.Option>
                            <Select.Option value={PointSizeBase.GROUP_BBOX_SIZE}>
                                Group bbox size
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Divider />
            <Row className='cvat-quality-settings-title'>
                <Text strong>
                    Line Comparison
                </Text>
                <CVATTooltip title={linesTooltip} className='cvat-settings-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                    <QuestionCircleOutlined
                        style={{ opacity: 0.5 }}
                    />
                </CVATTooltip>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='lineThickness'
                        label='Relative thickness (frame side %)'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <InputNumber min={0} max={1000} precision={0} />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='compareLineOrientation'
                        rules={[{ required: true, message: 'This field is required' }]}
                        valuePropName='checked'
                    >
                        <Checkbox>
                            <Text className='cvat-text-color'>Check orientation</Text>
                        </Checkbox>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name='lineOrientationThreshold'
                        label='Min similarity gain (%)'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <InputNumber min={0} max={100} precision={0} />
                    </Form.Item>
                </Col>
            </Row>
            <Divider />
            <Row className='cvat-quality-settings-title'>
                <Text strong>
                    Group Comparison
                </Text>
                <CVATTooltip title={groupTooltip} className='cvat-settings-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                    <QuestionCircleOutlined
                        style={{ opacity: 0.5 }}
                    />
                </CVATTooltip>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='compareGroups'
                        valuePropName='checked'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <Checkbox>
                            <Text className='cvat-text-color'>Compare groups</Text>
                        </Checkbox>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name='groupMatchThreshold'
                        label='Min group match threshold (%)'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <InputNumber min={0} max={100} precision={0} />
                    </Form.Item>
                </Col>
            </Row>
            <Divider />
            <Row className='cvat-quality-settings-title'>
                <Text strong>
                    Segmentation Comparison
                </Text>
                <CVATTooltip title={segmentationTooltip} className='cvat-settings-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                    <QuestionCircleOutlined
                        style={{ opacity: 0.5 }}
                    />
                </CVATTooltip>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='checkCoveredAnnotations'
                        valuePropName='checked'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <Checkbox>
                            <Text className='cvat-text-color'>Check object visibility</Text>
                        </Checkbox>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name='objectVisibilityThreshold'
                        label='Min visibility threshold (area %)'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <InputNumber min={0} max={100} precision={0} />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item
                        name='panopticComparison'
                        valuePropName='checked'
                        rules={[{ required: true, message: 'This field is required' }]}
                    >
                        <Checkbox>
                            <Text className='cvat-text-color'>Match only visible parts</Text>
                        </Checkbox>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}
