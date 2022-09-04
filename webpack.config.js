const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    devtool: 'inline-source-map',
    devServer: {
	static: {
            directory: path.join(__dirname, 'public'),
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.glsl$/,
                loader: 'raw-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(jpg|png)$/,
                loader: 'file-loader',
                exclude: /node_modules/,
                options: {
                    name: '[path][name].[ext]',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'public', 'dist'),
        filename: 'bundle.js',
        publicPath: '/dist/'
    },
};
