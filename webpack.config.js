const path = require('path');
const entry_path = path.resolve(__dirname, 'src', 'index.ts');
const output_path = path.resolve(__dirname, 'dist');
const node_modules_path = path.resolve(__dirname, 'node_modules');

module.exports = {
    mode: 'production',
    entry: entry_path,
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: node_modules_path,
            },
            {
                test: /\.glsl$/,
                loader: 'raw-loader',
                exclude: node_modules_path,
            },
            {
                test: /\.(jpg|png)$/,
                loader: 'file-loader',
                exclude: node_modules_path,
                options: {
                    name: '[path][name].[ext]',
                    publicPath: output_path,
                },
            },
        ],
    },
    output: {
        path: output_path,
        filename: 'bundle.js',
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: __dirname,
        publicPath: output_path,
    },
};
