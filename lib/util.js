// with two arguments
export const curry = (fn) => (a, b) => b === void 0 ? b => fn(a, b) : fn(a, b);