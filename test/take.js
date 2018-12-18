import test from 'zora';
import {take} from '../src/lib/operators';
import {counterIterable, breakableCounter, counterGenerator} from './util/source';

export default test('take operator', t => {

    t.test('basic', async t => {
        let i = 0;
        const to3 = counterGenerator();
        const stream = take(2, to3);

        for await (const item of stream) {
            t.equal(item, i, `should see item ${i}`);
            i++;
        }

        for await (const item of stream) {
            i++;
        }

        t.equal(i, 2, 'should have seen 2 iterations only');

    });

    t.test('forward the consumable nature of the underlying asyncIterator', async t => {
        let i = 0;
        const to3 = counterIterable();
        const stream = take(2, to3);

        for await (const item of stream) {
            t.equal(item, i, `should see the item ${i}`);
            i++;
        }

        t.equal(i, 2, 'should have seen 2 iterations');
        i = 0;

        for await (const item of stream) {
            t.equal(item, i, `should see the item ${i} again`);
            i++;
        }

        t.equal(i, 2, 'should have seen 2 iterations again');

    });

    t.test('forward control flow event', async t => {
        let i = 0;
        const to3 = breakableCounter();
        const stream = take(2, to3);
        for await (const item of stream) {
            i++;
            break;
        }

        t.equal(i, 1, 'should have done a single iteration');

        t.equal(to3.done, true, 'should have called the return of underlying iterator');
        t.equal(to3.index, 1, 'should have pulled one single time');
    });

    t.test('curried take', async t => {
        const getTwo = take(2);
        let i = 0;
        for await (const item of getTwo(counterGenerator())) {
            t.equal(item, i, `should have seen the item ${i}`);
            i++;
        }

        i = 0;
        for await (const item of getTwo(counterGenerator())) {
            t.equal(item, i, `should have seen the item ${i}`);
            i++;
        }
    });
});
