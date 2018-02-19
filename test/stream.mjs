import test from 'zora';
import {toAsync, proto, stream} from "../lib/stream.mjs";
import {counterGen, counterIterator} from "./util/source.mjs";

export default test('stream test suite', t => {
	t.test('from array', async t => {
		let iter = 0;
		const s = toAsync([0, 1, 2]);
		t.equal(typeof s[Symbol.asyncIterator], 'function', 'should be an async iterator');
		for await (const i of s) {
			t.equal(i, iter, `should see the value ${iter}`);
			iter++;
		}

		t.equal(iter, 3, 'should have seen 3 iterations');
	});

	t.test('from array: consume few times', async t => {
		let iter = 0;
		const s = toAsync([0, 1, 2]);
		for await (const i of s) {
			t.equal(i, iter, `should see the value ${iter}`);
			iter++;
		}
		t.equal(iter, 3, 'should have seen 3 iterations');
		iter = 0;
		for await (const i of s) {
			t.equal(i, iter, `should see the value ${iter} again`);
			iter++;
		}
		t.equal(iter, 3, 'should have seen 3 iterations again');
	});

	t.test('from generator', async t => {
		const gen = function * () {
			for (let i = 0; i < 3; i++) {
				yield i;
			}
		};
		let iter = 0;
		const iterable = gen();
		const s = toAsync(iterable);

		t.equal(typeof s[Symbol.asyncIterator], 'function', 'should be an async iterator');

		for await (const i of s) {
			t.equal(i, iter, `should see the value ${iter}`);
			iter++;
		}

		for await (const i of s) {
			iter++;
		}

		t.equal(iter, 3, 'should have seen 3 iterations only');
	});

	t.test('from [Symbol.iterator]', async t => {
		const gen = function * () {
			for (let i = 0; i < 3; i++) {
				yield i;
			}
		};

		const iterable = {
			[Symbol.iterator]: gen
		};
		let iter = 0;
		const s = toAsync(iterable);

		t.equal(typeof s[Symbol.asyncIterator], 'function', 'should be an async iterator');

		for await (const i of s) {
			t.equal(i, iter, `should see the value ${iter}`);
			iter++;
		}

		for await (const i of s) {
			iter++;
		}

		t.equal(iter, 6, 'should have consumed the iterable two times');
	});

	t.test('from an asyncIterable', async t => {
		const s = toAsync(counterGen());
		let iter = 0;
		t.equal(typeof s[Symbol.asyncIterator], 'function', 'should be an async iterator');

		for await (const i of s) {
			t.equal(i, iter, `should see the value ${iter}`);
			iter++;
		}

		for await (const i of s) {
			iter++;
		}
		t.equal(iter, 3, 'should have seen 3 iterations only');
	});

	t.test('from an asyncIterable: consume two times', async t => {
		let iter = 0;
		const s = toAsync(counterIterator());

		t.equal(typeof s[Symbol.asyncIterator], 'function', 'should be an async iterator');

		for await (const i of s) {
			t.equal(i, iter, `should see the value ${iter}`);
			iter++;
		}

		for await (const i of s) {
			iter++;
		}
		t.equal(iter, 6, 'should have seen 6 iterations');
	});

	t.test('stream factory: should have the stream proto', t => {
		const s = stream(counterGen());
		t.equal(Object.getPrototypeOf(s), proto, 'should have the stream prototype');
	});

	t.test('stream factory: map', async t => {
		const s = stream(counterGen())
			.map(i => i * i);

		t.equal(Object.getPrototypeOf(s), proto, 'should have the stream prototype');

		let i = 0;
		for await (const item of s) {
			t.equal(item, i * i, `should have seen ${i * i} the square of ${i}`);
			i++;
		}
		t.equal(i, 3, 'should have seen 3 iterations');
	});

	t.test('stream factory: filter', async t => {
		const s = stream(counterGen())
			.filter(i => i % 2 === 0);

		t.equal(Object.getPrototypeOf(s), proto, 'should have the stream prototype');

		const result = [];
		for await (const item of s) {
			result.push(item);
		}
		t.deepEqual(result, [0, 2], 'should have seen the odd numbers only');
		t.equal(result.length, 2, 'should have seen 2 iterations');
	});

	t.test('stream factory: filterMap', async t => {
		const s = stream([counterGen(), counterGen(5)])
			.flatMap(i => i * i);

		t.equal(Object.getPrototypeOf(s), proto, 'should have the stream prototype');

		const result = [];
		for await (const item of s) {
			result.push(item);
		}
		t.deepEqual(result, [0, 1, 4, 0, 1, 4, 9, 16], 'should have seen the flattened squared numbers');
		t.equal(result.length, 8, 'should have seen 8 iterations');
	});

	t.test('stream factory: slice (one argument)', async t => {
		const s = stream(counterGen(5))
			.slice(2);

		t.equal(Object.getPrototypeOf(s), proto, 'should have the stream prototype');

		const result = [];
		for await (const item of s) {
			result.push(item);
		}
		t.deepEqual(result, [2, 3, 4], 'should have seen starting from third item to the end');
		t.equal(result.length, 3, 'should have seen 3 iterations');
	});

	t.test('stream factory: slice (two arguments)', async t => {
		const s = stream(counterGen(5))
			.slice(2, 3);

		t.equal(Object.getPrototypeOf(s), proto, 'should have the stream prototype');

		const result = [];
		for await (const item of s) {
			result.push(item);
		}
		t.deepEqual(result, [2], 'should have seen starting from third item ending to the third');
		t.equal(result.length, 1, 'should have seen 1 iteration');
	});

	t.test('stream factory: concat', async t => {
		const s = stream(counterGen())
			.concat(counterGen(), 666, [1, 2], counterGen());

		t.equal(Object.getPrototypeOf(s), proto, 'should have the stream prototype');

		const result = [];
		for await (const item of s) {
			result.push(item);
		}
		t.deepEqual(result, [0, 1, 2, 0, 1, 2, 666, [1, 2], 0, 1, 2], 'should have seen the concatenated stream');
		t.equal(result.length, 11, 'should have seen 11 iterations');
	});

	t.test('stream factory reduce', async t => {
		const s = stream(counterGen(5));
		const value = await s.reduce((curr, acc) => curr + acc, 0);
		t.equal(value, 10, 'should see the sum of 5 first integers');
	});

	t.test('stream factory find', async t => {
		const s = stream(counterGen(10));
		const value = await s.find(i => i > 5 && i % 2 === 0);
		t.equal(value, 6, 'should return the first odd integer greater than 5');

		const notFound = await stream(counterGen()).find(i => i > 666);
		t.equal(notFound, undefined, 'should return undefined when not found');
	});

	t.test('stream factory findIndex', async t => {
		const s = stream(counterGen(10)).map(i => i * i);
		const value = await s.findIndex(i => i > 5 && i % 2 === 0);
		t.equal(value, 4, 'should return the index of the first odd squared integer greater than 5');
		const notFound = await stream(counterGen()).findIndex(i => i > 666);
		t.equal(notFound, -1, 'should return undefined when not found');

	});

	t.test('stream factory includes', async t => {
		const doesnotInclude = await stream(counterGen()).includes(666);
		t.equal(doesnotInclude, false);
		const includes = await stream(counterGen()).includes(2);
		t.equal(includes, true);
	});

	t.test('stream factory every', async t => {
		const hasEvery = await stream(counterGen()).every(i => i < 5);
		t.equal(hasEvery, true, 'every single item is lower than 5');
		const hasNotEvery = await stream(counterGen()).every(i => i % 2 === 0);
		t.equal(hasNotEvery, false, 'not every item is odd');
	});

	t.test('stream factory some', async t => {
		const some = await stream(counterGen()).some(i => i % 2 === 0);
		t.equal(some, true, 'some item is odd');
		const hasNot = await stream(counterGen()).some(i => i > 4);
		t.equal(hasNot, false, 'none item is greater than 4');
	});
});
