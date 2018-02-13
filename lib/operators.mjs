import {curry} from "./util";

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

//todo check with curry
export const reduce = async (fn, initVal, asyncIterable) => {
	if (initVal[Symbol.asyncIterator] && asyncIterable === void 0) {
		asyncIterable = initVal;
		initVal = void 0;
	}

	const iterator = asyncIterable[Symbol.asyncIterator]();
	let index = initVal !== void 0 ? 0 : 1;
	let acc = initVal !== void 0 ? initVal : await iterator.next();
	while (true) {
		const {value, done} = await iterator.next();
		if (done === true) {
			return acc;
		}
		acc = fn(acc, value, index, this);
		index++;
	}
};

const findTuple = curry(async (fn, asyncIterable) => {
	let index = 0;
	for await (const i of asyncIterable) {
		if (fn(i, index, asyncIterable)) {
			return {value: i, index: index};
		}
		index++;
	}
	return {value: undefined, index: -1};
});

export const find = curry(async (fn, asyncIterable) => (await findTuple(fn, asyncIterable)).value);

export const findIndex = curry(async (fn, asyncIterable) => (await findTuple(fn, asyncIterable)).index);

export const includes = curry(async (fn, asyncIterable) => (await findIndex(fn, asyncIterable)) > -1);

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

//todo refactor with every ?
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


