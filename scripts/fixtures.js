console.log('foo,bar,bim');

const int = () => Math.floor(Math.random() * 10);

for (let i = 0; i<50000;i++){
	console.log(`${int()},${int()},${int()}`);
}
