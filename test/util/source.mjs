export const wait = (time = 10) => new Promise(resolve => setTimeout(() => resolve(), time));

export const counterGen =async function * (limit = 3) {
	let i = 0;
	while (true) {
		if (i >= limit) {
			break;
		}
		await wait();
		yield i;
		i++;
	}
};

export const counterIterator = (limit = 3) => ({
	[Symbol.asyncIterator](){
		return counterGen(limit);
	}
});


export const breakableCounter = (limit = 3) => {
	let i = 0;
	let done = false;

	const instance = {
		[Symbol.asyncIterator]() {
			return this;
		},
		async next() {
			if (i >= limit || this.done === true) {
				return {done: true};
			}
			const item = {value: i, done: false};
			i++;
			return item;
		},

		async return() {
			done = true;
			return {done: true};
		}
	};

	Object.defineProperties(instance,{
		index: {
			get() {return i;}
		},
		done: {
			get() {return done;}
		}
	});

	return instance;

};