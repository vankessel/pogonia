const path = require('path');

// Make sure devServer.publicPath always starts and ends with a forward slash.
const publicPath = '/build/';
const nodeModulesPath = path.resolve(__dirname, 'node_modules');

module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: nodeModulesPath,
            },
            {
                test: /\.glsl$/,
                loader: 'raw-loader',
                exclude: nodeModulesPath,
            },
            {
                test: /\.(jpg|png)$/,
                loader: 'file-loader',
                exclude: nodeModulesPath,
                options: {
                    name: '[path][name].[ext]',
                    publicPath: publicPath,
                },
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, publicPath),
        filename: 'bundle.js',
    },
    devtool: 'source-map',
    devServer: {
        contentBase: __dirname,
        publicPath: publicPath,
    },
};
