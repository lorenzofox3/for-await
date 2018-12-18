import test from 'zora';
import {filter} from '../src/lib/operators';
import {counterIterable, breakableCounter, counterGenerator} from './util/source.js';

export default test('filter operator test suite', t => {

    t.test('basic filter', async t => {
        let i = 0;
        const to3 = counterGenerator();
        const filterStream = filter((x, index) => {
            t.equal(index, x, 'should have passed the index');
            return x % 2 === 0;
        }, to3);

        let result = [];

        for await (const item of filterStream) {
            result.push(item);
            i++;
        }

        t.deepEqual(result, [0, 2], 'should have kept odd numbers');

        for await (const item of filterStream) {
            i++;
        }

        t.equal(i, 2, 'should have seen 3 iterations only');
    });

    t.test('filter: forward the consumable nature of the underlying asyncIterator', async t => {
        let i = 0;
        const to3 = counterIterable();
        const filterStream = filter((x, index) => {
            t.equal(index, x, 'should have passed the index');
            return x % 2 === 0;
        }, to3);

        let result = [];

        for await (const item of filterStream) {
            result.push(item);
            i++;
        }

        t.deepEqual(result, [0, 2], 'should have kept odd numbers');

        result = [];

        for await (const item of filterStream) {
            result.push(item);
            i++;
        }

        t.deepEqual(result, [0, 2], 'should have kept odd numbers again');
        t.equal(i, 4, 'should have seen 6 iterations');

    });

    t.test('should forward control flow event', async t => {
        let i = 0;
        const to3 = breakableCounter();
        const filteredStream = filter(x => x % 2 === 0, to3);
        for await (const item of filteredStream) {
            i++;
            break;
        }

        t.equal(i, 1, 'should have done a single iteration');

        t.equal(to3.done, true, 'should have called the return of underlying iterator');
        t.equal(to3.index, 1, 'should have pulled one single time');

    });

    t.test('curried filter', async t => {
        const odd = filter(x => x % 2 === 0);
        let i = 0;
        let result = [];
        for await (const item of odd(counterGenerator())) {
            result.push(item);
            i++;
        }

        t.deepEqual(result, [0, 2], 'should have kept odd numbers only');

        result = [];

        i = 0;
        for await (const item of odd(counterGenerator())) {
            result.push(item);
            i++;
        }

        t.deepEqual(result, [0, 2], 'should have kept odd numbers only');
    });
});
