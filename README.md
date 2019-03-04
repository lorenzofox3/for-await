[![CircleCI](https://circleci.com/gh/lorenzofox3/for-await.svg?style=svg)](https://circleci.com/gh/lorenzofox3/for-await)

# for-await

Operators and stream semantic for asyncIterators.

``npm install @lorenzofox3/for-await``

## Motivation

[AsyncIterator](https://tc39.github.io/proposal-async-iteration/#sec-asynciterator-interface) and [AsyncGenerator](https://tc39.github.io/proposal-async-iteration/#sec-asyncgenerator-objects) (and the `for await` statement to consume them) have been integrated into es2018 specification and have started to land in different Javascript engines:

1. Nodejs > v9 (with harmony flag for some versions)
2. Chrome
3. Firefox

They provide a new way to create data structures which have the semantic of readable streams: ie that produce values in time (asynchronously)

```Javascript
const wait = (time = 100) => new Promise(resolve => {
  setTimeout(() => resolve(),time);
});

// produce a sequence of integer every 100ms
const counter = async function * (limit = 5){
    let i = 0;
    while(true){
        if(i >= limit){
            break;
        }
        await wait();
        yield i;
        i++;
    }
}

// consume it
for await (const i of counter()){
    console.log(i);
}

// > 0 (after 100ms)
// > 1 (after 200ms)
// ..
// > 4 (after 500ms)
```

And this is very powerful !

This library aims at providing operators and data structures with almost the same API than regular synchronous collections (like Array) implement, so you can manipulate
these streams as if they were synchronous collections.

```Javascript
import {stream} from 'for-await';

const oddSquaredCounter = stream(counter())
    .filter(i => i % 2 === 0) // keep odd
    .map(i => i * i) // square it

// and consume it

for await (const v of oddSquaredCounter){
   console.log(v);
}

// > 0 (after 100 ms)
// > 4 (after 300 ms)
// > 16 (after 500 ms)
```

This could sound familiar to anyone who has already tried [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming) or have used the same kind of abstractions on streams provided by some nodejs libraries (like [through](https://www.npmjs.com/package/through2)).

However this implementation relies only on native EcmaScript features which makes it very lightweight and easier to use on different platforms.

You will only have to implement an adapter (I will likely write modules for common data source in Nodejs and in the Browser) so your data source implements the standard asyncIterator interface (and this has become way more easier with async generators).

[See our csv parser for nodejs and browser]('./examples').

## Operators

### semantic
If you are not familiar with the synchronous iterable/iterator protocol, I strongly recommend the [Reginald Braithwaite book](https://leanpub.com/javascriptallongesix) and [his essays](http://raganwald.com/2017/07/22/closing-iterables-is-a-leaky-abstraction.html)

Note all the operators which do not return a scalar value follow the same semantic than the underlying source:
1. If source streams are consumable once the resulting iterable is consumable once
2. If source streams implements control flow hooks (like return or throw), these hooks will be called as well so your data source is properly released etc

For example in a synchronous world you already know that
```Javascript
const array = [0,1,2] // implements Iterable protocol

for (const i of array){
    console.log(i);
}

for (const i of array){
    console.log(i);
}

// > 0
// > 1
// > 2
// > 0
// > 1
// > 2

// However

const counterGen = function * (){
    yield 0;
    yield 1;
    yield 3;
}

const oneTwoThree = counterGen();

for (const i of onTwoThree){
    console.log(i);
}

for (const i of onTwoTree){
    console.log(i);
}

// > 0
// > 1
// > 2
// And nothing as the generator is already exhausted
```

The will be the same for our async iterators
```Javascript
import {map} from 'for-await';

// Assuming the asynchronous counter of the introduction
const zeroOneTwoSquared = map(x=>x*x, counter(3));

for await (const i of zeroOneTwoSquared){
    console.log(i);
}

for await (const i of zeroOneTwoSquared){
    console.log(i);
}

// > 0 (100ms)
// > 1 (200ms)
// > 4 (300ms)
// And nothing as the generator is already exhausted

//However

const iteratable = {
    [Symbol.asyncIterator]:counter
}

for await (const i of iterable){
    console.log(i);
}

for await (const i of iterable){
    console.log(i);
}

// > 0   (100ms)
// > 1   (200ms)
// > 4   (300ms)
// > 9   (400ms)
// > 16  (500ms)
// > 0   (600ms)
// > 1   (700ms)
// > 4   (800ms)
// > 9   (900ms)
// > 16 (1000ms)
```

Most of the operators are curried:

```Javascript
import {map} from 'for-await';

const square=map(x=>x*x);

for await (const i of square(counter()){
 // do something
}

//and another one
for await (const i of square(counter()){
 // do something
}
```

### operators list

#### return a new Async Iterable
1. map
2. filter
3. slice
4. flatMap (flatten stream of streams)
5. concat

#### Return a scalar (as a promise)
1. reduce
2. find
3. findIndex
4. includes
5. every
6. some

## Data structure

Even more convenient you can use the stream data structure which gives you almost the same API than Arrays.
1. An instance of a stream will implement all the operators above
2. Every method which returns an async Iterable will actually return a new instance of stream (so you can chain them together)
