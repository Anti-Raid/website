import {
	CanonicalColumn,
	CanonicalColumnType,
	CanonicalConfigOption,
	CanonicalInnerColumnType
} from '$lib/generated/types';
import { ChannelConstraints } from '$lib/inputconstraints';
import logger from './logger';
import { getAuthCreds } from '$lib/auth/getAuthCreds';
import { get } from '$lib/configs/functions/services';
import { fetchClient } from '$lib/fetch/fetch';
import { SettingsExecute, SettingsExecuteResponse } from '$lib/generated/types';

export type OperationTypes = 'View' | 'Create' | 'Update' | 'Delete';

export interface DispatchType {
	// The type of the input
	type: string;
	// The minimum length of the input
	minlength: number | undefined;
	// The maximum length of the input
	maxlength: number | undefined;
	// The allowed values of the input
	allowed_values: { [label: string]: string } | undefined;
	// If bitflag, then the values of the bitflag
	bitflag_values: { [label: string]: string } | undefined;
	// If channel, then the channelConstraints
	channel_constraints: ChannelConstraints | undefined;
	// Resolves column type
	resolved_column_type: CanonicalColumnType;
}

// Returns the type to be dispatched to InputDispatcher
export const getDispatchType = (
	fields: Record<string, any>,
	column: CanonicalColumn
): DispatchType => {
	const _setOnDispatchType = <T extends keyof DispatchType>(
		dispatchType: DispatchType,
		key: T,
		value: DispatchType[T]
	) => {
		// @ts-ignore
		if (!dispatchType[key] || (Array.isArray(dispatchType[key]) && dispatchType[key].length == 0)) {
			dispatchType[key] = value;
		}
		return dispatchType;
	};

	// Check for __{}_displaytype
	let dispatchType: DispatchType = {
		type: '',
		minlength: undefined,
		maxlength: undefined,
		allowed_values: undefined,
		bitflag_values: undefined,
		channel_constraints: undefined,
		resolved_column_type: column.column_type
	};

	const handleInner = (
		dispatchType: DispatchType,
		inner: CanonicalInnerColumnType
	): DispatchType => {
		let key = Object.keys(inner)[0];

		switch (key) {
			case 'String':
				if (!inner.String) throw new Error('String inner column type is undefined');
				_setOnDispatchType(dispatchType, 'minlength', inner.String.min_length);
				_setOnDispatchType(dispatchType, 'maxlength', inner.String.max_length);

				if (inner.String.allowed_values) {
					// Set the allowed values
					let allowedValues: { [label: string]: string } = {};
					inner.String.allowed_values.forEach((value) => {
						allowedValues[value] = value;
					});
					_setOnDispatchType(dispatchType, 'allowed_values', allowedValues);
				}

				logger.debug('Setting.getDispatchType', 'String.kind', inner.String.kind);

				// Handle the kind
				if (inner.String.kind == 'normal') _setOnDispatchType(dispatchType, 'type', 'string');
				else if (inner.String.kind == 'template')
					_setOnDispatchType(dispatchType, 'type', `string:textarea:template`);
				else if (inner.String.kind == 'templateRef')
					_setOnDispatchType(dispatchType, 'type', `string:templateref`);
				else _setOnDispatchType(dispatchType, 'type', inner.String.kind?.toString() || 'string');
				break;
			case 'BitFlag':
				if (!inner.BitFlag) throw new Error('BitFlag inner column type is undefined');
				_setOnDispatchType(dispatchType, 'type', 'bitflag');

				// Until the rust server code can handle bigint correctly, convert them here ourselves
				let values: { [label: string]: string } = {};

				Object.keys(inner.BitFlag.values).forEach((value) => {
					if (!inner.BitFlag) return; // TS can't infer that inner.BitFlag is still not null here
					values[value] = inner.BitFlag.values[value].toString();
				});

				_setOnDispatchType(dispatchType, 'bitflag_values', values);
			default:
				_setOnDispatchType(dispatchType, 'type', key.toLowerCase());
				break;
		}

		return dispatchType;
	};

	if (dispatchType.resolved_column_type.Scalar) {
		return handleInner(dispatchType, dispatchType.resolved_column_type.Scalar.inner);
	} else if (dispatchType.resolved_column_type.Array) {
		return handleInner(dispatchType, dispatchType.resolved_column_type.Array.inner);
	} else {
		return dispatchType;
	}
};

export enum ColumnState {
	Hidden,
	Disabled,
	Enabled
}

export const deriveColumnState = (
	configOpt: CanonicalConfigOption,
	column: CanonicalColumn,
	operationType: OperationTypes
): ColumnState => {
	if (operationType == 'View') {
		return ColumnState.Disabled; // View means read-only
	}

	if (column.ignored_for.includes(operationType)) {
		// Special case for Create operation, if create, the column is hidden to improve UX
		if (operationType == 'Create') {
			return ColumnState.Hidden;
		}
		return ColumnState.Disabled; // Ignored for this operation
	}

	// If primary key and not Create, then also yes
	if (operationType != 'Create' && column.id == configOpt.primary_key) {
		return ColumnState.Disabled;
	}

	return ColumnState.Enabled;
};

/**
 * Lite version of the Rust template_to_string. In particular, this implementation does not provide special variables
 */
export const templateToStringLite = (template: string, fields: Record<string, any>) => {
	if (template.startsWith('{') && template.endsWith('}')) {
		let possibleVarName = template.substring(1, template.length - 1);
		if (fields[possibleVarName]) return fields[possibleVarName];
	}

	let nt = template;
	for (const key in fields) {
		logger.debug('Setting.templateToStringLite', 'Replacing', key, fields[key], fields);
		nt = nt.replaceAll(`{${key}}`, fields[key]);
	}

	return nt;
};

/**
 * Wrapper interface for derived data
 */
export interface DerivedData {
	dispatchType: DispatchType;
	columnState: ColumnState;
	isCleared: boolean;
}

export const createFieldsForCreate = (
	columnField: Record<string, any>,
	configOpt: CanonicalConfigOption
): SettingsExecute => {
	let fields: Record<string, any> = {};

	Object.keys(columnField).forEach((k) => {
		let column = configOpt.columns.find((c) => c.id === k);

		if (!column) {
			return;
		}

		if (column.ignored_for.includes('Create')) {
			return;
		}

		fields[k] = columnField[k];
	});

	let payload: SettingsExecute = {
		operation: 'Create',
		setting: configOpt.id,
		fields
	};

	return payload;
};

export const createFieldsForUpdate = (
	columnField: Record<string, any>,
	configOpt: CanonicalConfigOption,
	allDerivedData: Record<string, DerivedData>
): SettingsExecute => {
	let fields: Record<string, any> = {};
	Object.keys(columnField).forEach((k) => {
		let column = configOpt.columns.find((c) => c.id === k);

		if (!column) {
			return;
		}

		if (configOpt.primary_key != column.id && column.ignored_for.includes('Update')) {
			return;
		}

		// Check if isCleared
		if (allDerivedData[k]?.isCleared) {
			fields[k] = null;
		} else {
			fields[k] = columnField[k];
		}
	});

	let payload: SettingsExecute = {
		operation: 'Update',
		setting: configOpt.id,
		fields
	};

	return payload;
};

interface SettingsFetchQueueEntry {
	guildId: string;
	exec: SettingsExecute;
	resolve: (value: SettingsExecuteResponse) => void;
	reject: (reason?: any) => void;
}

/**
 * A queue for fetching settings from the server
 *
 * NOTE: All settings requests should go through this queue to prevent spamming the server
 */
class SettingsFetchQueue {
	private cachedSettings: Map<string, SettingsExecuteResponse>;
	private fetchQueue: SettingsFetchQueueEntry[];
	private hasStartedQueue: boolean;

	constructor() {
		this.cachedSettings = new Map();
		this.fetchQueue = [];
		this.hasStartedQueue = false;
	}

	async addToQueue(
		guildId: string,
		settingsExecute: SettingsExecute
	): Promise<SettingsExecuteResponse> {
		if (!this.hasStartedQueue) {
			this.processQueue();
		}
		let promise = new Promise<SettingsExecuteResponse>((resolve, reject) => {
			this.fetchQueue.push({ guildId, exec: settingsExecute, resolve, reject });
		});
		return promise;
	}

	private createKey(settingsExecute: SettingsExecute): string | null {
		// Only view should cache as only view is idempotent
		if (settingsExecute.operation === 'View') {
			return JSON.stringify(settingsExecute);
		}
		return null;
	}

	private async fetchSetting(
		guildId: string,
		settingsExecute: SettingsExecute
	): Promise<SettingsExecuteResponse> {
		let key = this.createKey(settingsExecute);

		if (key) {
			let cachedSetting = this.cachedSettings.get(key);
			if (cachedSetting) {
				return cachedSetting;
			}
		}

		const creds = getAuthCreds();
		if (!creds) throw new Error('No auth credentials found');

		const res = await fetchClient(`${get('splashtail')}/guilds/${guildId}/settings`, {
			method: 'POST',
			auth: creds?.token,
			body: JSON.stringify(settingsExecute)
		});

		if (!res.ok) {
			let err = await res.error('Failed to fetch settings for this module');
			throw new Error(err);
		}

		const data = await res.json();

		if (key) {
			this.cachedSettings.set(key, data);
		}

		return data;
	}

	private async processQueue() {
		if (this.hasStartedQueue) {
			return; // Ensure we only have one queue running at a time
		}

		this.hasStartedQueue = true;

		while (true) {
			let entry = this.fetchQueue.shift();
			if (!entry) {
				await new Promise((resolve) => setTimeout(resolve, 0));
				continue;
			}
			try {
				let data = await this.fetchSetting(entry.guildId, entry.exec);
				entry.resolve(data);
			} catch (e) {
				entry.reject(e);
			}
		}
	}
}

export let settingsFetchQueue = new SettingsFetchQueue();
