// Декларации:
// Утверждаю: Атомик всегда отсортирован

var concatAssign: <B, A extends {push: (this: A, b: B) => void} | (B extends unknown[] ? {push: (this: A, ...b: B) => void} : never)>(lhs: A, rhs: B) => A = (lhs, rhs) => (((rhs as any)?.[Symbol.isConcatSpreadable] ?? Array.isArray(rhs)) ? (lhs as any).push.apply(lhs, rhs as any) : (lhs as any).push(rhs), lhs);
import assert from "node:assert"

const GOOD_CHUNKS_COUNT = 11

type Predicate<T> = (T: T, index: number, array: T[]) => boolean

export const enum ArrayEmulateStrategy {
  Partial,
  Proxied,
}

interface Configuration {
  chunks_count?: number
  revert?: boolean
  emulate?: ArrayEmulateStrategy
}
  
type Chunk<T> = LazySort<T>
  
type LazySortInner<T> = Configuration & {chunks: Chunk<T>[], min: number, max: number, calculated: boolean}
  
type WithValue<T> = [T, number]


export class LazySort<T> {
  emulate: ArrayEmulateStrategy
  revert: boolean
  chunks_count: number

  iterable: WithValue<T>[]
  length: number
  calculated = false
  
  is_atomic?: boolean
  max?: number
  min?: number
  chunk_range?: number
  chunks?: Chunk<T>[]
  chunk_thresholds?: number[]

  static ofNumbers(numbers: number[]) {
    return new this(numbers.map($1 => [$1, $1]))
  }
  static ofArrayMapValue<T>(array: T[], valueOf: (T: T, index: number, arr: T[]) => T) {
    return new this(array.map(($, i, arr) => [$, valueOf($, i, arr)] as WithValue<T>))
  }
  
  
  constructor(iterable1: WithValue<T>[], {revert: revert1 = false,chunks_count:  chunks_count1 = GOOD_CHUNKS_COUNT,emulate:  emulate1 = ArrayEmulateStrategy.Partial}: Configuration = {}) {
    this.iterable = iterable1;
    this.revert = revert1;
    this.chunks_count = chunks_count1;
    this.emulate = emulate1;
    assert(this.chunks_count >= 2)
    this.length = this.iterable.length
  }

  #to_proxied_array_emulator() {
    const instance = this.#to_partial_array_emulator()
    return new Proxy(instance, !todo)
  }

  #to_partial_array_emulator() {
    return new LazySortEntry(this)
  }
  
  get atomic_chunk_arr() {
    return this.chunks![0].iterable
  }
    
  chunks_update_thresholds_after(chunk_index: number, diff: number) {
    const results=[];for (let end1 = this.chunk_thresholds!.length, i1 = chunk_index; i1 < end1; ++i1) {const index = i1;
      results.push(this.chunk_thresholds![index] += diff)
    };return results;
  }
  entry() {
    if (!this.calculated) {
      const max1 = Math.max(...this.iterable.map($2 => $2[1]));this.max = max1;
      const min1 = Math.min(...this.iterable.map($3 => $3[1]));this.min = min1;
      const chunk_range1 = Math.ceil((this.max! - this.min!) / (this.chunks_count - 1));this.chunk_range = chunk_range1;
      this.is_atomic = ((
        this.chunks_count >= this.length)||(
        this.max - this.min === 0))
      const chunks1 = 
        (()=>{if (!this.is_atomic) { 
          const chunks = [...new Array(this.chunks_count)].map(() => [] as WithValue<T>[])
          this.iterable.forEach((x: WithValue<T>) => { 
            return chunks[Math.floor((x[1] - this.min!) / this.chunk_range!)].push(x)
          })
          return chunks.map($4 => new LazySort<T>($4, {revert: this.revert, chunks_count: this.chunks_count, emulate: this.emulate}))
        }
        else {
          return [ new LazySort<T>(
              this.iterable.toSorted((a, b) => (-1) ** +this.revert * (a[1] - b[1])),
              {revert: this.revert, chunks_count: this.chunks_count, emulate: this.emulate})]
        }})();this.chunks = chunks1;
      
      this.revert && this.chunks?.reverse()
      const chunk_thresholds1 = this.chunks?.reduce((acc: number[], next) => acc.concat([(acc[acc.length-1] || 0) + next.length]), []);this.chunk_thresholds = chunk_thresholds1;
    }

    this.calculated = true
    switch(this.emulate) {
      case ArrayEmulateStrategy.Partial: { return this.#to_partial_array_emulator()
      }
      case ArrayEmulateStrategy.Proxied: { return this.#to_proxied_array_emulator()
      }
    }
  }
}
    


export class LazySortEntry<T> extends Array {
  #source: LazySort<T>;constructor(source: LazySort<T>) {
    super()
    this.#source = source;
  }
  entry() {
    return this
  }
  get length() {
   return this.#source.length
  }
  set length(value) {
   let ref;((ref = this.toArray()).length = value,ref)
  }
  *[Symbol.iterator](): Generator<WithValue<T>> {
    for (let end2 = this.#source.length, i2 = 0; i2 < end2; ++i2) {const index = i2;
      yield this.positive_at(index)!
    }
  }
  toArray(): WithValue<T>[] {
    if (this.#source.is_atomic) { return this.#source.atomic_chunk_arr }
    return this.#source.chunks!.map($5 => $5.entry().toArray()).flat()
  }
  positive_at(at: number): (WithValue<T> | undefined) {
    if (this.#source.is_atomic!) { return this.#source.atomic_chunk_arr[at] }
    const chunk_index = this.#source.chunk_thresholds!.findIndex((a1 => a1> at))
    if (chunk_index === -1) { return undefined }
    const chunk = this.#source.chunks![chunk_index]
    return chunk.entry().positive_at(at - (this.#source.chunk_thresholds![chunk_index - 1] || 0))
  }
  find(predicate: Predicate<WithValue<T>>) {
    return this.positive_at(this.findIndex(predicate))
  }
  findIndex(predicate: Predicate<WithValue<T>>) {
    for (let end3 = this.length, i3 = 0; i3 < end3; ++i3) {const index = i3;
      if (predicate(this.positive_at(index)!, index, this as unknown as WithValue<T>[])) { return index }
    }
    return -1
  }
  findLast(predicate: Predicate<WithValue<T>>) {
    return this.positive_at(this.findIndexLast(predicate))
  } 
  findIndexLast(predicate: Predicate<WithValue<T>>) {
    for (let i4 = this.length + -1; i4 >= 0; --i4) {const index = i4;
      if (predicate(this.positive_at(index)!, index, this as unknown as WithValue<T>[])) { return index }
    }
    return -1
  }
  indexOf(item: WithValue<T>): number {
    if (this.#source.is_atomic!) { return this.#source.atomic_chunk_arr.indexOf(item) }
    let results1;results1=[];let ref1;for (const chunk_index in ref1 = this.#source.chunks!) {const chunk = ref1[chunk_index]; 
      let ref2;if ((ref2 = chunk.entry().indexOf(item))) {const index = ref2;
        results1 = [index, +chunk_index];break
      } else {results1.push(void 0)}
    };const [index, chunk_index] =results1
    if (chunk_index === undefined) { return -1 }
    return (this.#source.chunk_thresholds![chunk_index - 1] || 0) + index!
  }
  some(predicate: Predicate<WithValue<T>>) {
    return (this.findIndex(predicate)) !== -1
  }
  
  // @ts-expect-error
  every(predicate: Predicate<WithValue<T>>) {
    return !this.some(predicate)
  }
  splice(start: number, deleteCount: number, ...items: WithValue<T>[]): WithValue<T>[] {
    start < 0 && (start = this.#source.length + start);
    (start + deleteCount > this.#source.length) && (deleteCount = this.#source.length - start);
    (deleteCount - items.length !== 0) && (this.#source.length -= (deleteCount - items.length))
    if (this.#source.is_atomic!) { return this.#source.atomic_chunk_arr.splice(start, deleteCount, ...items) }
    const end = start + deleteCount
    const removed = [] as WithValue<T>[]
    const ret: WithValue<T>[] = removed

    this.#source.chunks!
     .map((chunk, chunk_index) => { 
      return ({
        chunk_start: this.#source.chunk_thresholds![chunk_index - 1] || 0,
        chunk_end: this.#source.chunk_thresholds![chunk_index],
        chunk,
        chunk_index})
     })
      
     .filter(({chunk_start, chunk_end, chunk}) => {
      if (!chunk.length) { return false }
      return start < chunk_end && chunk_start <= end
     })
     .forEach(({chunk_start, chunk_end, chunk_index, chunk}, changed_index, changes_array) => { 
        const replace_start = changed_index === 0
          ? start - chunk_start
          : 0

        const replace_end = changed_index === changes_array.length - 1 
          ? end - chunk_start
          : chunk.length

        const _removed_count = replace_end - replace_start
        const _added_items = items.slice(replace_start + chunk_start - start, changed_index === changes_array.length - 1 ? undefined : replace_end + chunk_start - start)
        this.#source.chunks_update_thresholds_after(chunk_index, _added_items.length - _removed_count)
        return concatAssign(removed, chunk.entry().splice(
          replace_start, 
          _removed_count, 
          ..._added_items))
     })

    return ret
  }
}
     
      
  // slice()
  // push()
  // pop()
  // unshift()
  // shift()
  

