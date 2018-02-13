const curry = (fn) => (a, b) => b === void 0 ? b => fn(a, b) : fn(a, b);

const map = curry(async function * (fn, asyncIterable) {
	for await (const i of asyncIterable) {
		yield fn(i);
	}
});

const filter = fn => async function * (asyncIterable) {
	for await (const i of asyncIterable) {
		if (fn(i) === true) {
			yield i;
		}
	}
};

// a kind of until
const take = number => async function * (asyncIterable) {
	let count = 1;
	for await (const i of asyncIterable) {
		if (number !== undefined && count > number) {
			break;
		}
		yield i;
		count++;
	}
};

const skip = (number = 0) => async function * (asyncIterable) {
	let count = 0;
	for await (const i of asyncIterable) {
		if (count < number) {
			count++;
			continue;
		}
		yield i;
	}
};

const flatMap = fn => async function * (asyncIterable) {
	for (const i of asyncIterable) {
		if (i[Symbol.asyncIterator]) {
			yield * i;
		} else {
			yield i;
		}
	}
};

const concat = async function * (...values) {
	for (const i of values) {
		if (i[Symbol.asyncIterator] !== void 0) {
			yield * i;
		} else {
			yield i;
		}
	}
};

const findTuple = fn => async asyncIterable => {
	let index = 0;
	for await (const i of asyncIterable) {
		if (fn(i, index, asyncIterable)) {
			return {value: i, index: index};
		}
		index++;
	}
	return {value: undefined, index: -1};
};

const slice = (start = 0, end = undefined) => async function * (asyncIterable) {
	const toSkip = skip(start);
	const toTake = take(end !== undefined ? end - start : end);
	for await (const i of toTake(toSkip(asyncIterable))) {
		yield i;
	}
};

const find = fn => async asyncIterable => {
	const {value} = await findTuple(fn)(asyncIterable);
	return value;
};

const findIndex = fn => async asyncIterable => {
	const {index} = await findTuple(fn)(asyncIterable);
	return index;
};

const includes = fn => async asyncIterable => {
	const index = await findIndex(fn)(asyncIterable);
	return index > -1;
};

//todo some and every


// transform an iterable (or async iterable)
const from = (iterable) => async function * () {
	for await (const i of iterable) {
		const item = await i;
		yield item;
	}
};


const stream = iterable => {
	return {
		[Symbol.asyncIterator]: from(iterable),
		map(fn) {
			return stream(map(fn)(this));
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

const after = (time = 200) => value => new Promise(resolve => {
	setTimeout(() => {resolve(value)}, time);
});
const after100 = after();
const asyncCounter = (limit = 5) => {
	return {
		[Symbol.asyncIterator]: async function * () {
			let counter = 0;
			while (true) {
				if (counter > limit) {
					break;
				}
				const val = await after100(counter);
				yield val;
				counter++;
			}
		}
	};
};


// const s = toAsync(asyncCounter());
const counterSync = function * (limit = 5) {
	let count = 0;
	while (count <= limit) {
		yield count;
		count++;
	}
};
const nestedCounter = function * (limit = 5) {
	let count = 0;
	while (count <= limit) {
		yield asyncCounter(limit);
		count++;
	}
};
const square = map(x => x * x);


// (async function () {
// 	let fiveFirstInteger = asyncCounter();
// 	let asStream =() => stream(fiveFirstInteger());
// 	for await (const i of asStream()
// 		.map(x => x * x)
// 		.filter(x => x % 2 === 0)) {
// 		console.log(i)
// 	}
//
// 	for await (const i of asStream()
// 		.map(x => x * x)
// 		.filter(x => x % 2 === 0)) {
// 		console.log(i)
// 	}
// })();

//with nodejs stream stream

const fromStream = async function * (stream) {
	let exhausted = false;
	const onData = () => new Promise(resolve => {
		stream.once('readable', () => {
			resolve(stream.read());
		});
	});

	try {
		while (true) {
			const chunk = await onData();
			if (chunk === null) {
				exhausted = true;
				break;
			}
			yield chunk;
		}
	} finally {
		if (!exhausted) {
			stream.close();
		}
	}
};

const csvStream = () => fromStream(require('fs').createReadStream('./fixture.csv', {encoding: 'utf8'}));

(async function () {
	const toAsync = iterable => ({
		[Symbol.asyncIterator]: async function * () {
			yield *iterable;
		}
	});


	const str = toAsync([0, 1, 2, 3, 4, 5]);
	//
	const strBis = asyncCounter();
	//


	// for await (const i of strBis){
	// 	console.log(i);
	// }


	// const square = map(x => x * x);
	//
	// const toFive = asyncCounter();
	//
	// for await(const i of square(toFive)) {
	// 	console.log(i);
	// }
	//
	// for await(const i of square(toFive)) {
	// 	console.log(i);
	// }

	// create a line stream from the csv file
	// const lines = () => stream(csvStream())
	// 	.map(chunk => stream(chunk.split('\n')))
	// 	.flatMap(x => x);

	// get header values
	// const headerLine = await lines()
	// 	.find((_, index) => index === 0);

	// const headers = headerLine.split(';');

	// produce data
	// const data = () => lines()
	// 	.slice(1) //skip first line now
	// 	.map(line => line.split(';'))
	// 	.map(props => {
	// 		const dataLine = {};
	// 		headers.forEach((val, i) => {
	// 			dataLine[val] = props[i];
	// 		});
	// 		return dataLine;
	// 	});

	// const sumFoo = await data().reduce((acc, curr) => acc + Number(curr.foo), 0);
	//
	// console.log(sumFoo);


	// consume data
	// for await (const line of data()) {
	// 	console.log(line);
	// }

})();