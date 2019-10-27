const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    devtool: 'inline-source-map',
    devServer: {
        contentBase: __dirname,
        publicPath: '/dist/',
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
                    publicPath: 'dist/',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
};
