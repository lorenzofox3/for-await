// with two arguments
export const curry = (fn) => (a, b) => b === void 0 ? b => fn(a, b) : fn(a, b);
export const toCurriedIterable = gen => curry((a, b) => ({
	[Symbol.asyncIterator]() {
		return gen(a, b);
	}
}));
export const toIterable = gen => (...args) => ({
	[Symbol.asyncIterator]() {
		return gen(...args);
	}
});