import { resolve } from 'node:path'
import { type GlobOptions, glob } from 'glob'
import {
	AggregationContext,
	type Aggregator,
	type ExecutionPayload,
	type NodeFsOrMemfsFs,
} from './defineAggregator/Aggregator.js'

export async function useAggregator<
	T,
	CustomMetrix extends object,
	OutfilesData extends Record<string, unknown>,
>(
	aggregator: Aggregator<T, CustomMetrix, OutfilesData>,
	{
		overrideExecutionPayload,
		overrideReadMatched,
	}: {
		overrideExecutionPayload?: ExecutionPayload
		overrideReadMatched?: (path: string, fs: NodeFsOrMemfsFs) => Promise<T>
	} = {},
) {
	const _payload = overrideExecutionPayload || aggregator.executionPayload
	const _readMatched = overrideReadMatched || aggregator.readMatched
	const matches: { path: string; value: T }[] = await Promise.all(
		(
			await glob(aggregator.pattern, {
				cwd: _payload.agregation.baseUrl,
				fs: _payload.agregation.fs as NodeFsOrMemfsFs as GlobOptions['fs'],
				absolute: true,
			})
		).map(async (path) => ({
			path,
			value: await _readMatched(path, _payload.agregation.fs),
		})),
	)
	const result = await aggregator.script(
		new AggregationContext(aggregator, matches),
	)
	/////////////////////////////////////////////////////////////////////
	// Apply outfiles 																						 		 //

	if (_payload.flushOutfiles) {
		const { dir, fs, cleandir } = _payload.flushOutfiles
		if (cleandir) {
			await fs.promises.rm(dir, { recursive: true, force: true })
		}
		await fs.promises.mkdir(dir, { recursive: true })
		for (const [path, data] of Object.entries(result.outfiles)) {
			await fs.promises.writeFile(resolve(dir, path), JSON.stringify(data))
		}
	}

	// 								 																						 		 //
	/////////////////////////////////////////////////////////////////////
	return result
}
