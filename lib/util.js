"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
// with two arguments
const curry = exports.curry = fn => (a, b) => b === void 0 ? b => fn(a, b) : fn(a, b);
const toCurriedIterable = exports.toCurriedIterable = gen => curry((a, b) => ({
	[Symbol.asyncIterator]() {
		return gen(a, b);
	}
}));
const toIterable = exports.toIterable = gen => (...args) => ({
	[Symbol.asyncIterator]() {
		return gen(...args);
	}
});