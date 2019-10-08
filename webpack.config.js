const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    devtool: 'inline-source-map',
    devServer: {
        contentBase: __dirname,
        publicPath: '/dist/'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.glsl$/,
                use: 'raw-loader',
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: [ '.ts', '.js', '.glsl'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
};
