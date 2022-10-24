const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    devtool: 'inline-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, '/'),
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
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'dist/' // Must be relative to work on github pages. Must have trailing slash.
    },
};
