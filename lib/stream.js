export const toAsync = iterable => ({
	[Symbol.asyncIterator]: async function * () {
		for (const i of iterable) {
			yield i;
		}
	}
});

export const stream = iterable => {

	const source = iterable[Symbol.asyncIterator] ? iterable : toAsync(iterable);

	return {
		[Symbol.asyncIterator]: source[Symbol.asyncIterator],
		map(fn) {
			return stream(map(fn,this));
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
