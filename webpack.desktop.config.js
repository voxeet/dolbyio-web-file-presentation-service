const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './client/desktop.js',
    output: {
        path: path.resolve(__dirname, 'dist_desktop'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /.less$/,
                use: ['style-loader', 'css-loader', 'less-loader'],
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: './client/public/index.html',
            js: [],
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: './node_modules/@voxeet/voxeet-web-sdk/dist/dvwc_impl.wasm', noErrorOnMissing: true },
                { from: './node_modules/@voxeet/voxeet-web-sdk/dist/voxeet-dvwc-worker.js', noErrorOnMissing: true },
                { from: './node_modules/@voxeet/voxeet-web-sdk/dist/voxeet-worklet.js', noErrorOnMissing: true },
                { from: './node_modules/@voxeet/voxeet-web-sdk/dist/vsl_impl.bin', noErrorOnMissing: true },
                { from: './node_modules/@voxeet/voxeet-web-sdk/dist/vsl_impl.wasm', noErrorOnMissing: true },
           ]
        }),
    ],
};
