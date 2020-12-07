//const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "bundle.js"
    },

    //watch: true,

    //watchOptions: {
    //    ignored: /node_modules/
    //},

    // Enable sourcemaps for debugging webpack's output.
    //devtool: "source-map",
    devtool: "eval-cheap-source-map",

    //optimization: {
    //    removeAvailableModules: false,
    //    removeEmptyChunks: false,
    //    splitChunks: false,
    //},

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    //stats: 'verbose',

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" },

            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: ''
                        }
                    },
                    'css-loader',
                    {
                        loader: 'postcss-loader'
                    }
                ],
                //include: [
                //    path.resolve(__dirname, 'node_modules/bootstrap/dist/css'),
                //    path.resolve(__dirname, 'node_modules/leaflet/dist'),
                //    path.resolve(__dirname, 'src'),
                //]
            },

            {
                test: /\.(ttf|eot|svg|png|jpg|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader'
            }
        ]
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'bundle.css'
        }),
    ]

    // Other options...
};
