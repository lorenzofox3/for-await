import * as operators from './operators';
import {toIterable} from './util';

/*
  The iterable won't always be consumed with a for await statement (which implicitly convert an iterable into a asyncIterable) so we need to explicitly make it async iterable
  for await (const t of [1,2,3,4,5]){
    //no problem
  }

  but

  const iterator = [1,2,3][Symbol.asyncIterator]();
  //problem
 */
export const toAsync = toIterable(async function* (iterable) {
    yield* iterable;
});

export const proto = {
    [Symbol.asyncIterator]() {
        return this._source[Symbol.asyncIterator]();
    },
    map(fn) {
        return stream(operators.map(fn, this));
    },
    filter(fn) {
        return stream(operators.filter(fn, this));
    },
    flatMap(fn) {
        return stream(operators.flatMap(fn, this));
    },
    slice(start = 0, end = void 0) {
        return stream(operators.slice(start, end, this));
    },
    concat(...values) {
        return stream(operators.concat(this, ...values));
    },
    reduce(fn, initialValue) {
        return operators.reduce(fn, initialValue, this);
    },
    find(fn) {
        return operators.find(fn, this);
    },
    findIndex(fn) {
        return operators.findIndex(fn, this);
    },
    includes(item, from = 0) {
        return operators.includes(item, from, this);
    },
    every(fn) {
        return operators.every(fn, this);
    },
    some(fn) {
        return operators.some(fn, this);
    }
};

export const stream = iterable => {
    const source = !iterable[Symbol.asyncIterator] ? toAsync(iterable) : iterable; // we make a difference as any wrap of iterable has performance impact (for the moment)
    return Object.create(proto, {_source: {value: source}});
};
