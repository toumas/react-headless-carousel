var path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/Carousel.js',
    output: {
        path: path.resolve('lib'),
        filename: 'index.js',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                use: 'babel-loader',
            },
        ],
    },
    optimization: {
        minimize: false,
    },
};
