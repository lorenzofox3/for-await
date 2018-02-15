"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.some = exports.every = exports.includes = exports.findIndex = exports.find = exports.reduce = exports.concat = exports.slice = exports.flatMap = exports.skip = exports.take = exports.filter = exports.map = undefined;

var _util = require("./util.mjs");

const map = exports.map = (0, _util.toCurriedIterable)(async function* (fn, asyncIterable) {
	let index = 0;
	for await (const i of asyncIterable) {
		yield fn(i, index, asyncIterable);
		index++;
	}
});

const filter = exports.filter = (0, _util.toCurriedIterable)(async function* (fn, asyncIterable) {
	let index = 0;
	for await (const i of asyncIterable) {
		if (fn(i, index, asyncIterable) === true) {
			yield i;
		}
		index++;
	}
});

const take = exports.take = (0, _util.toCurriedIterable)(async function* (number, asyncIterable) {
	let count = 1;
	for await (const i of asyncIterable) {
		if (number !== undefined && count > number) {
			break;
		}
		yield i;
		count++;
	}
});

const skip = exports.skip = (0, _util.toCurriedIterable)(async function* (limit, asyncIterable) {
	let count = 0;
	for await (const i of asyncIterable) {
		if (count < limit) {
			count++;
			continue;
		}
		yield i;
	}
});

const flatMap = exports.flatMap = (0, _util.toCurriedIterable)(async function* (fn, asyncIterable) {
	for await (const i of asyncIterable) {
		if (i[Symbol.asyncIterator]) {
			yield* map(fn, i);
		} else {
			yield fn(i);
		}
	}
});

const acutalSlice = (0, _util.toIterable)(async function* (s, e, iterable) {
	const toSkip = skip(s);
	const toTake = take(e !== void 0 ? e - s : e);
	for await (const i of toTake(toSkip(iterable))) {
		yield i;
	}
});
const slice = exports.slice = (start, end, asyncIterable) => {
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

const concat = exports.concat = (0, _util.toIterable)(async function* (...values) {
	for (const i of values) {
		if (i[Symbol.asyncIterator]) {
			yield* i;
		} else {
			yield i;
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
		const { value, done } = await next();
		if (done === true) {
			return acc;
		}
		acc = fn(acc, value, index, asyncIterable);
	}
};
const reduce = exports.reduce = (fn, initVal, asyncIterable) => {
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
			return { value: i, index: index };
		}
		index++;
	}
	return { value: undefined, index: -1 };
};

const find = exports.find = (0, _util.curry)(async (fn, asyncIterable) => (await findTuple(fn, asyncIterable)).value);

const findIndex = exports.findIndex = (0, _util.curry)(async (fn, asyncIterable) => (await findTuple(fn, asyncIterable)).index);

const actualIncludes = async (item, from, iterable) => {
	const strictEqualToItem = findIndex(x => x === item);
	return (await strictEqualToItem(skip(from, iterable))) > -1;
};
const includes = exports.includes = (item, from, asyncIterable) => {
	let start = from;
	let iterable = asyncIterable;

	if (from && from[Symbol.asyncIterator] !== void 0) {
		start = 0;
		iterable = from;
	}

	if (iterable === void 0) {
		return iterable => actualIncludes(item, start, iterable);
	}

	return actualIncludes(item, start, iterable);
};

const every = exports.every = (0, _util.curry)(async (fn, asyncIterable) => {
	let index = 0;
	for await (const i of asyncIterable) {
		if (!fn(i, index, asyncIterable)) {
			return false;
		}
		index++;
	}
	return true;
});

const some = exports.some = (0, _util.curry)(async (fn, asyncIterable) => {
	let index = 0;
	for await (const i of asyncIterable) {
		if (fn(i, index, asyncIterable)) {
			return true;
		}
		index++;
	}
	return false;
});