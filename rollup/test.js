import commonjs from 'rollup-plugin-commonjs';
import node from 'rollup-plugin-node-resolve';

export default {
	input: './test/index.mjs',
	output: {
		file:'./test/debug/node.js',
		format: 'cjs'
	},
	plugins: [node(), commonjs()]
}