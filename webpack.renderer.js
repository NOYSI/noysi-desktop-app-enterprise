const path = require('path');
const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    'desktop': './src/renderer/index.ts'
  },

  output: {
    path: path.join('dist'),
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    //root: [path.resolve('src', 'renderer')],
    modules: [
      path.resolve('src', 'renderer'),
      'node_modules'
    ],
    extensions: ['.ts', '.js']
  },

  module: {
    loaders: [
      { test: /\.ts$/, exclude : 'node_modules', loader: 'ts-loader!angular2-template-loader' },
      { test: /\.json$/, exclude : 'node_modules', loader: 'json-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg|jpeg|gif)$/, loader: 'file-loader' },
      { test: /\.(svg|ttf|woff(2)?|eot)(\?.*)?$/, loader: 'file-loader' },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.(pug|jade)$/, loader: 'pug-html-loader' }
    ]
  },

  plugins: [
    //new webpack.optimize.OccurenceOrderPlugin(true),

    // new webpack.optimize.CommonsChunkPlugin({
    //   name: ['app', 'vendor', 'polyfills'],
    //   minChunks: Infinity
    // }),

    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      __dirname
    ),

    new HtmlWebpackPlugin({
      template: 'src/renderer/index.html',
      inject: 'body',
      chunksSortMode: 'none'
    }),

    new CopyWebpackPlugin([
      {
        from: 'src/renderer/assets',
        to: 'assets'
      }
    ], { ignore: [] })

  ],

  // module: {
  //   loaders: [
  //     {
  //       test: /\.ts$/,
  //       loaders: ['ts', 'angular2-template-loader']
  //     },
  //     {
  //       test: /\.css$/,
  //       loaders: ['to-string-loader', 'css-loader']
  //     },
  //     {
  //       test: /\.html$/,
  //       loader: 'raw-loader'
  //     }
  //   ]
  // },

  target: 'electron-renderer',

  node: {
    global: true,
    crypto: 'empty',
    module: false,
    Buffer: false,
    clearImmediate: false,
    setImmediate: false
  }

}
