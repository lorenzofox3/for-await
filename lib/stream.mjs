import {map, filter}from './operators.mjs'

/**
 * The iterable won't always be consumed with a for await statement (which implicitly convert an iterable into a asyncIterable) so we need to explicitly make it async iterable
 * for await (const t of [1,2,3,4,5]){
 *   //no problem
 * }
 *
 * but
 *
 * const iterator = [1,2,3][Symbol.asyncIterator]();
 * //problem
 *
 */
export const toAsync = iterable => ({
	[Symbol.asyncIterator]: async function * () {
		yield * iterable;
	}
});

export const stream = iterable => {

	const source = toAsync(iterable);

	return {
		[Symbol.asyncIterator]: source[Symbol.asyncIterator],
		map(fn) {
			return stream(map(fn, this));
		},
		filter(fn) {
			return stream(filter(fn)(this));
		},
		concat(...values) {
			return stream(concat(this, ...values));
		},
		slice(start, end) {
			return stream(slice(start, end)(this));
		},
		flatMap(fn) {
			return stream(flatMap(fn)(this));
		},
		async reduce(fn, initialValue) {
			const iterator = this[Symbol.asyncIterator]();
			let index = initialValue !== undefined ? 0 : 1;
			let acc = initialValue !== undefined ? initialValue : await iterator.next();
			while (true) {
				const {value, done} = await iterator.next();
				if (done === true) {
					return acc;
				}
				acc = fn(acc, value, index, this);
				index++;
			}
		},
		async find(fn) {
			return find(fn)(this);
		},
		async findIndex(fn) {
			return findIndex(fn)(this);
		},
		async includes(fn) {
			return includes(fn)(this);
		}
	}
};
