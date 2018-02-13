import test from 'zora';
import {toAsync} from "../lib/stream.mjs";

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
		const wait10ms = () => new Promise(resolve => setTimeout(() => resolve(), 10));
		const gen = async function * () {
			let i = 0;
			while (i < 3) {
				await wait10ms();
				yield i;
				i++
			}
		};
		let iter = 0;
		const s = toAsync(gen());

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
		const wait10ms = () => new Promise(resolve => setTimeout(() => resolve(), 10));
		const gen = async function * () {
			let i = 0;
			while (i < 3) {
				await wait10ms();
				yield i;
				i++
			}
		};
		let iter = 0;
		const s = toAsync({
			[Symbol.asyncIterator]:gen
		});

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
});
