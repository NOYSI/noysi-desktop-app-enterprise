const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {

  entry: {
    main: './src/main/index.ts'
  },

  output: {
    path: path.join('dist'),
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    //root: [path.resolve('src', 'main')],
    modules: [
      path.resolve('src', 'main'),
      'node_modules'
    ],
    extensions: ['.ts', '.js']
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      { test: /\.json$/, exclude: 'node_modules', loader: 'json-loader' },
    ]
  },

  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/package.json' }
    ]),
    new CopyWebpackPlugin([
      {
        from: 'src/main/assets',
        to: 'assets'
      },
      {
        from: 'node_modules/electron-pdf-window/pdfjs',
        to: 'pdfjs'
      }
    ], { ignore: [] })
  ],

  target: 'electron-main',

  node: {
    global: true,
    crypto: 'empty',
    module: false,
    Buffer: false,
    clearImmediate: false,
    setImmediate: false,
    __dirname: false,
    __filename: false
  }

}
