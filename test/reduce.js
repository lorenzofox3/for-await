import {reduce} from '../src/lib/operators';
import test from 'zora';
import {counterGenerator} from './util/source.js';

export default test('test suite for reduce', t => {

    t.test('basic', async t => {
        let index = 0;
        const value = await reduce((acc, curr, i) => {
            t.equal(i, index, 'should have forwarded the index to the callback');
            index++;
            return acc + curr;
        }, 0, counterGenerator(5));

        t.equal(value, 10, 'should equal to the sum of 0+1+2+3+4');
    });

    t.test('with no initial value', async t => {
        let index = 1;
        const value = await reduce((acc, curr, i) => {
            t.equal(i, index, 'should have forwarded the index to the callback');
            index++;
            return acc + curr;
        }, counterGenerator(5));

        t.equal(value, 10, 'should equal to the sum of 0+1+2+3+4');
    });

    t.test('curried', async t => {
        let index = 0;
        const reducer = reduce((acc, curr, i) => {
            t.equal(i, index, 'should have forwarded the index to the callback');
            index++;
            return acc + curr;
        }, 0);

        const value = await reducer(counterGenerator(5));
        t.equal(value, 10, 'should equal to the sum of 0+1+2+3+4');
    });

    t.test('curried with no initial value', async t => {
        let index = 1;
        const reducer = reduce((acc, curr, i) => {
            t.equal(i, index, 'should have forwarded the index to the callback');
            index++;
            return acc + curr;
        });

        const value = await reducer(counterGenerator(5));
        t.equal(value, 10, 'should equal to the sum of 0+1+2+3+4');
    });

});
