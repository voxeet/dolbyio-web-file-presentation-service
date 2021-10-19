const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    ],
};
