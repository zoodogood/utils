import type { MaybePromise } from '@zoodogood/utils/type-helpers'
import {
	type AggregationContext,
	type AggregationResult,
	Aggregator,
	type ExecutionPayload,
} from './Aggregator.js'

export function defineAggregator<
	T,
	CustomMetrix extends object,
	OutfilesData extends Record<string, unknown>,
>({
	pattern,
	readMatched,
	script,
	executionPayload,
}: {
	pattern: string
	readMatched: (path: string) => Promise<T>
	script: (
		ctx: AggregationContext<T, CustomMetrix, OutfilesData>,
	) => MaybePromise<AggregationResult<CustomMetrix, OutfilesData>>
	executionPayload: ExecutionPayload
}) {
	return new Aggregator(pattern, readMatched, script, executionPayload)
}
