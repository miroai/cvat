// Copyright (C) 2019-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import PluginRegistry from './plugins';
import {
    LabelType, ModelProviders, ModelKind, ShapeType,
} from './enums';
import {
    SerializedModel, ModelParams, MLModelTip, MLModelLabel,
} from './core-types';

export default class MLModel {
    private serialized: SerializedModel;

    constructor(serialized: SerializedModel) {
        this.serialized = { ...serialized };
    }

    public get id(): string | number {
        return this.serialized.id;
    }

    public get name(): string {
        return this.serialized.name;
    }

    public get labels(): MLModelLabel[] {
        return Array.isArray(this.serialized.labels_v2) ? [...this.serialized.labels_v2] : [];
    }

    public get supportedShapeTypes(): ShapeType[] | undefined {
        return this.serialized.supported_shape_types;
    }

    public get version(): number {
        return this.serialized.version;
    }

    public get description(): string {
        return this.serialized.description;
    }

    public get kind(): ModelKind {
        return this.serialized.kind;
    }

    public get displayKind(): string {
        if (this.kind === ModelKind.DETECTOR) {
            switch (this.returnType) {
                case LabelType.TAG: return 'classifier';
                case LabelType.MASK: return 'segmenter';
                default: // fall back on the original kind
            }
        }
        return this.kind;
    }

    public get params(): ModelParams {
        const result: ModelParams = {
            canvas: {
                minPosVertices: this.serialized.min_pos_points,
                minNegVertices: this.serialized.min_neg_points,
                startWithBox: this.serialized.startswith_box,
                startWithBoxOptional: this.serialized.startswith_box_optional,
            },
        };

        return result;
    }

    public get tip(): MLModelTip {
        return {
            message: this.serialized.help_message,
            gif: this.serialized.animated_gif,
        };
    }

    public get owner(): string {
        return this.serialized?.owner?.username || '';
    }

    public get provider(): string {
        return this.serialized?.provider || ModelProviders.CVAT;
    }

    public get isDeletable(): boolean {
        return this.provider !== ModelProviders.CVAT;
    }

    public get createdDate(): string | undefined {
        return this.serialized?.created_date;
    }

    public get updatedDate(): string | undefined {
        return this.serialized?.updated_date;
    }

    public get url(): string | undefined {
        return this.serialized?.url;
    }

    public get returnType(): LabelType {
        const uniqueLabelTypes = new Set(this.labels.map((label) => label.type));

        if (uniqueLabelTypes.size !== 1) return LabelType.ANY;

        const [labelType] = uniqueLabelTypes;
        return labelType;
    }

    public async preview(): Promise<string> {
        const result = await PluginRegistry.apiWrapper.call(this, MLModel.prototype.preview);
        return result;
    }
}

Object.defineProperties(MLModel.prototype.preview, {
    implementation: {
        writable: false,
        enumerable: false,
        value: async function implementation(): Promise<string | null> {
            return null;
        },
    },
});
