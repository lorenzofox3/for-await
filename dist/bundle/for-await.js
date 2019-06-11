var ForAwait = (function (exports) {
    'use strict';

    // with two arguments
    const curry = (fn) => (a, b) => b === void 0 ? b => fn(a, b) : fn(a, b);
    const toCurriedIterable = gen => curry((a, b) => ({
        [Symbol.asyncIterator]() {
            return gen(a, b);
        }
    }));
    const toIterable = gen => (...args) => ({
        [Symbol.asyncIterator]() {
            return gen(...args);
        }
    });

    const map = toCurriedIterable(async function* (fn, asyncIterable) {
        let index = 0;
        for await (const i of asyncIterable) {
            yield fn(i, index, asyncIterable);
            index++;
        }
    });

    const filter = toCurriedIterable(async function* (fn, asyncIterable) {
        let index = 0;
        for await (const i of asyncIterable) {
            if (fn(i, index, asyncIterable) === true) {
                yield i;
            }
            index++;
        }
    });

    const take = toCurriedIterable(async function* (number, asyncIterable) {
        let count = 1;
        for await (const i of asyncIterable) {
            if (number !== undefined && count > number) {
                break;
            }
            yield i;
            count++;
        }
    });

    const skip = toCurriedIterable(async function* (limit, asyncIterable) {
        let count = 0;
        for await (const i of asyncIterable) {
            if (count < limit) {
                count++;
                continue;
            }
            yield i;
        }
    });

    const flatMap = toCurriedIterable(async function* (fn, asyncIterable) {
        for await (const i of asyncIterable) {
            if (i[Symbol.asyncIterator]) {
                yield* map(fn, i);
            } else {
                yield fn(i);
            }
        }
    });

    const acutalSlice = toIterable(async function* (s, e, iterable) {
        const toSkip = skip(s);
        const toTake = take(e !== void 0 ? e - s : e);
        for await (const i of toTake(toSkip(iterable))) {
            yield i;
        }
    });
    const slice = (start, end, asyncIterable) => {
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

    const concat = toIterable(async function* (...values) {
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
            const {value, done} = await next();
            if (done === true) {
                return acc;
            }
            acc = fn(acc, value, index, asyncIterable);
        }
    };
    const reduce = (fn, initVal, asyncIterable) => {
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
                return {value: i, index: index};
            }
            index++;
        }
        return {value: void 0, index: -1};
    };

    const find = curry(async (fn, asyncIterable) => (await findTuple(fn, asyncIterable)).value);

    const findIndex = curry(async (fn, asyncIterable) => (await findTuple(fn, asyncIterable)).index);

    const actualIncludes = async (item, from, iterable) => {
        const strictEqualToItem = findIndex(x => x === item);
        return (await strictEqualToItem(skip(from, iterable))) > -1;
    };
    const includes = (item, from, asyncIterable) => {
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

    const every = curry(async (fn, asyncIterable) => {
        let index = 0;
        for await(const i of asyncIterable) {
            if (!fn(i, index, asyncIterable)) {
                return false;
            }
            index++;
        }
        return true;
    });

    const some = curry(async (fn, asyncIterable) => {
        let index = 0;
        for await(const i of asyncIterable) {
            if (fn(i, index, asyncIterable)) {
                return true;
            }
            index++;
        }
        return false;
    });

    /*
      The iterable won't always be consumed with a for await statement (which implicitly convert an iterable into a asyncIterable) so we need to explicitly make it async iterable
      for await (const t of [1,2,3,4,5]){
        //no problem
      }

      but

      const iterator = [1,2,3][Symbol.asyncIterator]();
      //problem
     */
    const toAsync = toIterable(async function* (iterable) {
        yield* iterable;
    });

    const proto = {
        [Symbol.asyncIterator]() {
            return this._source[Symbol.asyncIterator]();
        },
        map(fn) {
            return stream(map(fn, this));
        },
        filter(fn) {
            return stream(filter(fn, this));
        },
        flatMap(fn) {
            return stream(flatMap(fn, this));
        },
        slice(start = 0, end = void 0) {
            return stream(slice(start, end, this));
        },
        concat(...values) {
            return stream(concat(this, ...values));
        },
        reduce(fn, initialValue) {
            return reduce(fn, initialValue, this);
        },
        find(fn) {
            return find(fn, this);
        },
        findIndex(fn) {
            return findIndex(fn, this);
        },
        includes(item, from = 0) {
            return includes(item, from, this);
        },
        every(fn) {
            return every(fn, this);
        },
        some(fn) {
            return some(fn, this);
        }
    };

    const stream = iterable => {
        const source = !iterable[Symbol.asyncIterator] ? toAsync(iterable) : iterable; // we make a difference as any wrap of iterable has performance impact (for the moment)
        return Object.create(proto, {_source: {value: source}});
    };

    exports.concat = concat;
    exports.every = every;
    exports.filter = filter;
    exports.find = find;
    exports.findIndex = findIndex;
    exports.flatMap = flatMap;
    exports.from = toAsync;
    exports.includes = includes;
    exports.map = map;
    exports.reduce = reduce;
    exports.skip = skip;
    exports.slice = slice;
    exports.some = some;
    exports.stream = stream;
    exports.take = take;

    return exports;

}({}));
