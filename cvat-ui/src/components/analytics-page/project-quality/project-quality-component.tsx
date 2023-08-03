// Copyright (C) 2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useEffect } from 'react';
import { Row } from 'antd/lib/grid';
import notification from 'antd/lib/notification';
import Text from 'antd/lib/typography/Text';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import {
    Project, QualityReport, QualitySettings, Task, getCore,
} from 'cvat-core-wrapper';
import { useIsMounted, useStateIfMounted } from 'utils/hooks';
import ConflictsSummary from './conflicts-summary';
import CoverageSummary from './coverage-summary';
import QualitySettingsModal from '../shared/quality-settings-modal';
import QualitySummary from './quality-summary';
import TaskList from './task-list';

const core = getCore();

interface Props {
    project: Project,
}

type ListOfTasks = Awaited<ReturnType<typeof core['tasks']['get']>>;

function ProjectQualityComponent(props: Props): JSX.Element {
    const { project } = props;

    const isMounted = useIsMounted();
    const [fetching, setFetching] = useStateIfMounted<boolean>(true);
    const [projectReport, setProjectReport] = useStateIfMounted<QualityReport | null>(null);
    const [tasksReports, setTasksReports] = useStateIfMounted<QualityReport[]>([]);
    const [tasks, setTasks] = useStateIfMounted<ListOfTasks>(Object.defineProperty(([] as Task[]), 'count', { value: 0 }) as ListOfTasks);
    const [qualitySettings, setQualitySettings] = useStateIfMounted<QualitySettings | null>(null);
    const [qualitySettingsFetching, setQualitySettingsFetching] = useStateIfMounted<boolean>(true);
    const [qualitySettingsVisible, setQualitySettingsVisible] = useStateIfMounted<boolean>(false);

    useEffect(() => {
        setFetching(true);
        setQualitySettingsFetching(true);

        function handleError(error: Error): void {
            if (isMounted()) {
                notification.error({
                    description: error.toString(),
                    message: 'Could not initialize quality analytics page',
                });
            }
        }

        core.analytics.quality.reports({ pageSize: 1, target: 'project', projectId: project.id }).then(([report]) => {
            let reportRequest = Promise.resolve<QualityReport[]>([]);
            if (report) {
                reportRequest = core.analytics.quality.reports({
                    pageSize: 'all',
                    parentId: report.id,
                    target: 'task',
                });
            }

            const settingsRequest = core.analytics.quality.settings.get({ projectId: project.id }, true);
            const tasksRequest = core.tasks.get({ pageSize: 'all', projectId: project.id });

            Promise.all([reportRequest, settingsRequest, tasksRequest]).then((results) => {
                setProjectReport(report || null);
                setTasksReports(results[0]);
                setQualitySettings(results[1]);
                setTasks(results[2]);
            }).catch(handleError).finally(() => {
                setQualitySettingsFetching(false);
                setFetching(false);
            });
        }).catch(handleError);
    }, [project?.id]);

    return (
        <div className='cvat-project-quality-page'>
            {
                fetching ? (
                    <CVATLoadingSpinner size='large' />
                ) : (
                    <>
                        <Row>
                            <QualitySummary
                                projectId={project.id}
                                projectReport={projectReport}
                                setQualitySettingsVisible={setQualitySettingsVisible}
                            />
                        </Row>
                        <Row gutter={16}>
                            <ConflictsSummary projectId={project.id} projectReport={projectReport} />
                            <CoverageSummary
                                projectReport={projectReport}
                                tasks={tasks}
                                reports={tasksReports}
                            />
                        </Row>
                        {
                            (!projectReport || !projectReport.summary.gtCount) ? (
                                <Row>
                                    <Text type='secondary' className='cvat-task-quality-reports-hint'>
                                        Quality estimation requires annotated GT jobs in the project tasks.
                                        Please add more GT jobs to make the estimates more accurate.
                                    </Text>
                                </Row>
                            ) : null
                        }
                        <Row>
                            <TaskList
                                tasks={tasks}
                                tasksReports={tasksReports}
                                projectReport={projectReport}
                            />
                        </Row>
                        <QualitySettingsModal
                            redirectToProjectId={null}
                            qualitySettings={qualitySettings}
                            setQualitySettings={setQualitySettings}
                            fetching={qualitySettingsFetching}
                            visible={qualitySettingsVisible}
                            setVisible={setQualitySettingsVisible}
                        />
                    </>
                )
            }
        </div>
    );
}

export default React.memo(ProjectQualityComponent);