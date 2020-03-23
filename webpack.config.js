// For some reason bundling with webpack causes consumer application to receive an empty import...
// I think it's something to do with the "main: './dist/pogonia.js'" and "types: './dist/types/index.d.ts'" entries in
// package.json. Changing to not bundle for now.

const path = require('path');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');

// Make sure devServer.publicPath always starts and ends with a forward slash.
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
                    publicPath: '/dist/',
                },
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        filename: 'pogonia.js',
    },
    devtool: 'source-map',
    devServer: {
        contentBase: __dirname,
        publicPath: '/dist/',
    },
};
