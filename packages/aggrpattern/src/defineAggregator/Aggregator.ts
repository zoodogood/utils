import type { MaybePromise } from '@zoodogood/utils/type-helpers'
export type NodeFsOrMemfsFs =
	| typeof import('node:fs')
	| typeof import('memfs')['fs']

export interface ExecutionPayload {
	flushOutfiles: false | { dir: string; fs: NodeFsOrMemfsFs; cleandir: boolean }

	agregation: {
		fs: NodeFsOrMemfsFs
		baseUrl: string
	}
}

export interface AggregationResult<
	CustomMetrix extends object,
	OutfilesData extends Record<string, unknown>,
> {
	outfiles: OutfilesData
	customMetrix: CustomMetrix
}

export class AggregationContext<
	T,
	CustomMetrix extends object,
	OutfilesData extends Record<string, unknown>,
> {
	constructor(
		public aggregator: Aggregator<T, CustomMetrix, OutfilesData>,
		public matches: {
			path: string
			value: T
		}[],
	) {}
}

export class Aggregator<
	T,
	CustomMetrix extends object,
	OutfilesData extends Record<string, unknown>,
> {
	constructor(
		public pattern: string,
		public readMatched: (path: string) => Promise<T>,
		public script: (
			ctx: AggregationContext<T, CustomMetrix, OutfilesData>,
		) => MaybePromise<AggregationResult<CustomMetrix, OutfilesData>>,
		public executionPayload: ExecutionPayload,
	) {}
}
