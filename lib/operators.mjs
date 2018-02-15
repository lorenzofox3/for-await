import {curry} from "./util.mjs";

export const map = curry((fn, asyncIterable) => ({
	[Symbol.asyncIterator]: async function * () {
		let index = 0;
		for await (const i of asyncIterable) {
			yield fn(i, index, asyncIterable);
			index++;
		}
	}
}));

export const filter = curry((fn, asyncIterable) => ({
	[Symbol.asyncIterator]: async function * () {
		let index = 0;
		for await (const i of asyncIterable) {
			if (fn(i, index, asyncIterable) === true) {
				yield i;
			}
			index++;
		}
	}
}));

export const take = curry((number, asyncIterable) => ({
	[Symbol.asyncIterator]: async function * () {
		let count = 1;
		for await (const i of asyncIterable) {
			if (number !== undefined && count > number) {
				break;
			}
			yield i;
			count++;
		}
	}
}));

export const skip = curry((limit, asyncIterable) => ({
	[Symbol.asyncIterator]: async function * () {
		let count = 0;
		for await (const i of asyncIterable) {
			if (count < limit) {
				count++;
				continue;
			}
			yield i;
		}
	}
}));

export const flatMap = curry((fn, asyncIterable) => ({
	[Symbol.asyncIterator]: async function * () {
		for await (const i of asyncIterable) {
			if (i[Symbol.asyncIterator]) {
				yield * map(fn, i);
			} else {
				yield fn(i);
			}
		}
	}
}));

const acutalSlice = (s, e, iterable) => ({
	[Symbol.asyncIterator]: async function * () {
		const toSkip = skip(s);
		const toTake = take(e !== void 0 ? e - s : e);
		for await (const i of toTake(toSkip(iterable))) {
			yield i;
		}
	}
});
export const slice = (start, end, asyncIterable) => {
	let s = start || 0;
	let e = end;
	let iterable = asyncIterable;
	if (start && start[Symbol.asyncIterator] !== void 0) {
		iterable = start;
		s = 0;
		e = void 0;
	} else if (end && end[Symbol.asyncIterator] !== void 0) {
		iterable = end;
		s = start;
		e = void 0;
	} else if (asyncIterable === void 0) {
		return iterable => acutalSlice(s, e, iterable);
	}
	return acutalSlice(s, e, iterable);
};

export const concat = (...values) => ({
	[Symbol.asyncIterator]: async function * () {
		for (const i of values) {
			if (i[Symbol.asyncIterator]) {
				yield * i;
			} else {
				yield i;
			}
		}
	}
});

const actualReduce = async (fn, initialValue, asyncIterable) => {
	let index = -1;
	const iterator = asyncIterable[Symbol.asyncIterator]();
	const next = async () => {
		index++;
		return iterator.next();
	};
	let acc = initialValue;

	if (initialValue === void 0) {
		acc = (await next()).value;
	}

	while (true) {
		const {value, done} = await next();
		if (done === true) {
			return acc;
		}
		acc = fn(acc, value, index, asyncIterable);
	}
};
export const reduce = (fn, initVal, asyncIterable) => {
	let acc = initVal;
	let iterable = asyncIterable;

	if (initVal && initVal[Symbol.asyncIterator] !== void 0) {
		iterable = initVal;
		acc = void 0;
	}

	if (iterable === void 0) {
		return iterable => actualReduce(fn, acc, iterable);
	}

	return actualReduce(fn, acc, iterable);
};

const findTuple = async (fn, asyncIterable) => {
	let index = 0;
	for await (const i of asyncIterable) {
		if (fn(i, index, asyncIterable)) {
			return {value: i, index: index};
		}
		index++;
	}
	return {value: undefined, index: -1};
};

export const find = curry(async (fn, asyncIterable) => (await findTuple(fn, asyncIterable)).value);

export const findIndex = curry(async (fn, asyncIterable) => (await findTuple(fn, asyncIterable)).index);

const actualIncludes = async (item, from, iterable) => {
	const strictEqualToItem = findIndex(x => x === item);
	return (await strictEqualToItem(skip(from, iterable))) > -1;
};
export const includes = (item, from, asyncIterable) => {
	let start = from;
	let iterable = asyncIterable;

	if (from && from[Symbol.asyncIterator] !== void 0) {
		start = 0;
		iterable = from;
	}

	if(iterable === void 0){
		return iterable => actualIncludes(item, start, iterable);
	}

	return actualIncludes(item, start, iterable)
};

export const every = curry(async (fn, asyncIterable) => {
	let index = 0;
	for await(const i of asyncIterable) {
		if (!fn(i, index, asyncIterable)) {
			return false;
		}
		index++;
	}
	return true;
});

export const some = curry(async (fn, asyncIterable) => {
	let index = 0;
	for await(const i of asyncIterable) {
		if (fn(i, index, asyncIterable)) {
			return true;
		}
		index++;
	}
	return false;
});
