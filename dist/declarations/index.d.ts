/// <reference lib="esnext" />

interface MapCallback<T, U> {
    (item: T, index: number, iterable: AsyncIterable<T>): AsyncIterable<U>;
}

declare function map<T, U>(callback: MapCallback<T, U>): (iterable: AsyncIterable<T>) => AsyncIterable<U>;
declare function map<T, U>(callback: MapCallback<T, U>, iterable: AsyncIterable<T>): AsyncIterable<U>;

interface PredicateCallback<T> {
    (item: T, index: number, iterable: AsyncIterable<T>): boolean;
}

declare function filter<T>(callback: PredicateCallback<T>): (iterable: AsyncIterable<T>) => AsyncIterable<T>;
declare function filter<T>(callback: PredicateCallback<T>, iterable: AsyncIterable<T>): AsyncIterable<T>;

declare function take(number: number): <T>(iterable: AsyncIterable<T>) => AsyncIterable<T>;
declare function take<T>(number: number, iterable: AsyncIterable<T>): AsyncIterable<T>;

declare function skip(number: number): <T>(iterable: AsyncIterable<T>) => AsyncIterable<T>;
declare function skip<T>(number: number, iterable: AsyncIterable<T>): AsyncIterable<T>;

type ItemOrAsyncIterable<T> = T | AsyncIterable<T>;

declare function flatMap<T, U>(fn: MapCallback<T, U>): (iterable: AsyncIterable<ItemOrAsyncIterable<T>>) => AsyncIterable<U>;
declare function flatMap<T, U>(fn: MapCallback<T, U>, iterable: AsyncIterable<ItemOrAsyncIterable<T>>): AsyncIterable<U>;

declare function slice<T>(iterable: AsyncIterable<T>): AsyncIterable<T>;
declare function slice<T>(start: number, iterable: AsyncIterable<T>): AsyncIterable<T>;
declare function slice<T>(start: number, end: number, iterable: AsyncIterable<T>): AsyncIterable<T>;
declare function slice(start?: number, end?: number): <T>(iterable: AsyncIterable<T>) => AsyncIterable<T>;

declare function concat<T>(...args: ItemOrAsyncIterable<T>[]): AsyncIterable<T>;

interface ReduceCallback<T, U> {
    (accumulator: U, currentItem: T, index: number, iterable: AsyncIterable<T>): Promise<U>;
}

declare function reduce<T, U>(fn: ReduceCallback<T, U>, initialValue?: U): (iterable: AsyncIterable<T>) => Promise<U>;
declare function reduce<T, U>(fn: ReduceCallback<T, U>, iterable: AsyncIterable<T>): Promise<U>;
declare function reduce<T, U>(fn: ReduceCallback<T, U>, initialValue: U, iterable: AsyncIterable<T>): Promise<U>;

interface TupleCallback<T> {
    (item: T, index: number, iterable: AsyncIterable<T>): boolean;
}

declare function find<T>(fn: TupleCallback<T>): (iterable: AsyncIterable<T>) => Promise<T>;
declare function find<T>(fn: TupleCallback<T>, iterable: AsyncIterable<T>): Promise<T>;

declare function findIndex<T>(fn: TupleCallback<T>): (iterable: AsyncIterable<T>) => Promise<number>;
declare function findIndex<T>(fn: TupleCallback<T>, iterable: AsyncIterable<T>): Promise<number>;

declare function includes<T>(item: T, from ?: number): (iterable: AsyncIterable<T>) => Promise<boolean>;
declare function includes<T>(item: T, iterable: AsyncIterable<T>): Promise<boolean>;
declare function includes<T>(item: T, from: number, iterable: AsyncIterable<T>): Promise<boolean>;

declare function every<T>(fn: PredicateCallback<T>, iterable: AsyncIterable<T>): Promise<boolean>;
declare function every<T>(fn: PredicateCallback<T>): (iterable: AsyncIterable<T>) => Promise<boolean>;

declare function some<T>(fn: PredicateCallback<T>, iterable: AsyncIterable<T>): Promise<boolean>;
declare function some<T>(fn: PredicateCallback<T>): (iterable: AsyncIterable<T>) => Promise<boolean>;

declare function from<T>(iterable: Iterable<T>): AsyncIterable<T>;

export interface Stream<T> extends AsyncIterable<T> {
    map<U>(fn: MapCallback<T, U>): Stream<U>;

    filter(fn: PredicateCallback<T>): Stream<T>;

    flatMap<U>(fn: MapCallback<T, U>): Stream<U>;

    slice(start?: number, end?: number): Stream<T>;

    concat(...values: ItemOrAsyncIterable<T>[]): Stream<T>;

    reduce<U>(fn: ReduceCallback<T, U>, initialValue?: U): Promise<U>;

    find(fn: TupleCallback<T>): Promise<T>;

    findIndex(fn: TupleCallback<T>): Promise<number>;

    includes(item: T, from?: number): Promise<boolean>;

    every(fn: PredicateCallback<T>): Promise<boolean>;

    some(fn: PredicateCallback<T>): Promise<boolean>;
}

declare function stream<T>(iterable: Iterable<T> | AsyncIterable<T>): Stream<T>;
