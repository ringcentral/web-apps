const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: '#cheap-module-source-map',
    entry: {
        iframe: './src/iframe/bundle.ts',
        'iframe.min': './src/iframe/bundle.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'ringcentral-web-apps-[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: ['RCApps', 'IFrameSDK'],
        libraryTarget: 'umd',
        // libraryExport: 'default',
    },
    externals: {
        react: 'React',
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                include: /\.min\.js$/,
            }),
        ],
    },
};
