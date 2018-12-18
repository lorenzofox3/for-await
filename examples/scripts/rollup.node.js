import node from 'rollup-plugin-node-resolve';

export default {
    input: './examples/node.js',
    output: [{
        format: 'cjs'
    }],
    plugins:[node()]
};
