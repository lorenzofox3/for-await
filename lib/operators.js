import {curry} from "./util";

export const map = curry(async function * (fn, asyncIterable) {
	for await (const i of asyncIterable) {
		yield fn(i);
	}
});

export const filter = curry(async function * (fn, asyncIterable) {
	let index = 0;
	for await (const i of asyncIterable) {
		if (fn(i, index, asyncIterable) === true) {
			yield i;
		}
		index++
	}
});

export const take = curry(async function * (number, asyncIterable) {
	let count = 1;
	for await (const i of asyncIterable) {
		if (number !== undefined && count > number) {
			break;
		}
		yield i;
		count++;
	}
});

export const skip = curry(async function * (number, asyncIterable) {
	let count = 0;
	const limit = number || 0;
	for await (const i of asyncIterable) {
		if (count < limit) {
			count++;
			continue;
		}
		yield i;
	}
});

export const flatMap = curry(async function * (fn, asyncIterable) {
	for await (const i of asyncIterable) {
		if (i[Symbol.asyncIterator]) {
			//yield*
			for await (const j of i) {
				yield fn(j);
			}
		} else {
			yield fn(i);
		}
	}
});

export const concat = async function * (...values) {
	for (const i of values) {
		if (i[Symbol.asyncIterator]) {
			for await (const j of i) {
				yield j;
			}
		} else {
			yield i;
		}
	}
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

//todo
export const slice = (start = 0, end = undefined) => async function * (asyncIterable) {
	const toSkip = skip(start);
	const toTake = take(end !== undefined ? end - start : end);
	for await (const i of toTake(toSkip(asyncIterable))) {
		yield i;
	}
};

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

//todo refactor with every;
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


