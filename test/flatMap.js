import {test} from 'zora';
import {flatMap} from '../src/lib/operators';
import {counterGenerator} from './util/source';

export default test('flat map operator', t => {
    t.test('basic: should simply map if items are not asyncIterable', async t => {
        let index = 0;
        const gen = async function* () {
            yield 0;
            index++;
            yield 'foo';
            index++;
            yield ['bar'];
            index++;
            yield false;
        };

        const result = [];
        let iter = 0;
        const iterator = flatMap(x => x, gen());

        for await (const item of iterator) {
            iter++;
            result.push(item);
        }

        for await (const item of iterator) {
            iter++;
        }

        t.equal(iter, 4, 'should have seen 4 iterations only');
        t.deepEqual(result, [0, 'foo', ['bar'], false]);
    });

    t.test('basic: should flatten asyncIterator items', async t => {
        let index = 0;
        const gen = async function* () {
            yield 666;
            index++;
            yield counterGenerator();
            index++;
            yield ['bar'];
            index++;
            yield false;
        };

        const result = [];
        let iter = 0;
        for await (const item of flatMap(x => x, gen())) {
            iter++;
            result.push(item);
        }
        t.equal(index, 3, 'should have seen 3 index increments');
        t.equal(iter, 6, 'should have seen 6 iterations');
        t.deepEqual(result, [666, 0, 1, 2, ['bar'], false]);
    });

    t.test('should forward the consumable nature of the asyncIterable', async t => {
        let index = 0;
        const gen = async function* () {
            yield 666;
            index++;
            yield counterGenerator();
            index++;
            yield ['bar'];
            index++;
            yield false;
        };

        let result = [];
        let iter = 0;
        const iterator = flatMap(x => x, {
            [Symbol.asyncIterator]: gen
        });

        for await (const item of iterator) {
            iter++;
            result.push(item);
        }

        t.equal(iter, 6, 'should have seen 6 iterations');
        t.deepEqual(result, [666, 0, 1, 2, ['bar'], false]);

        iter = 0;
        result = [];

        for await (const item of iterator) {
            iter++;
            result.push(item);
        }


        t.equal(iter, 6, 'should have seen 6 iterations again');
        t.deepEqual(result, [666, 0, 1, 2, ['bar'], false]);
    });

    t.test('forward control flow event', async t => {

        let i = 0;
        let done = false;

        const iterator = {
            [Symbol.asyncIterator]() {
                return this;
            },
            async next() {
                if (done === true || i > 2) {
                    return {done: true};
                }

                const value = {value: counterGenerator(), done: false};
                i++;
                return value;
            },

            async return() {
                done = true;
                return {done: true};
            }
        };

        let iter = 0;
        const result = [];
        for await (const item of flatMap(x => x, iterator)) {
            iter++;
            result.push(item);
            break;
        }

        t.equal(iter, 1, 'should have pulled one item of the main stream');
        t.deepEqual(result, [0], 'should have iterated only on the first item of the sub stream');
        t.equal(done, true, 'should have called the return hook of the source stream');

    });
});

