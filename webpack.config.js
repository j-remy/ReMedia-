const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {
  // Entry files for our popup and background pages
  entry: {
    popup: './src/popup.js',
    prepPage: './src/prepPage.js',
    annotations_list: './src/annotations_list.js',
    contentScript: './src/contentScript.js'
  },
  // Extension will be built into ./dist folder, which we can then load as unpacked extension in Chrome
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  // Here we define loaders for different file types
    module: {
        loaders: [
            {
                test: /.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /.jsx$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                }
            }
        ]
    },
  // module: {
  //   rules: [
  //     // We use Babel to transpile JSX
  //     {
  //       test: /\.js$/,
  //       include: [
  //         path.resolve(__dirname, './src')
  //       ],
  //       use: 'babel-loader'
  //     }
  //     // {
  //     //   test: /\.css$/,
  //     //   loader: ExtractTextPlugin.extract({
  //     //     fallback: 'style-loader',
  //     //     use: 'css-loader'
  //     //   })
  //     // },
  //     // {
  //     //   test: /\.(ico|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
  //     //   use: 'file-loader?limit=100000'
  //     // },
  //     // {
  //     //   test: /\.(jpe?g|png|gif|svg)$/i,
  //     //   use: [
  //     //     'file-loader?limit=100000',
  //     //     {
  //     //       loader: 'img-loader',
  //     //       options: {
  //     //         enabled: true,
  //     //         optipng: true
  //     //       }
  //     //     }
  //     //   ]
  //     // }
  //   ]
  // },
  plugins: [
    // // create CSS file with all used styles
    // new ExtractTextPlugin('bundle.css'),
    // // create popup.html from template and inject styles and script bundles
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['popup'],
      filename: 'popup.html',
      template: './src/popup.html'
    }),
    // new HtmlWebpackPlugin({
    //     inject: true,
    //     chunks: ['prepPage'],
    //     filename: 'backgroundPage.html',
    //     template: './src/backgroundPage.html'
    // }),
    // copy extension manifest and icons
    new CopyWebpackPlugin([
      { from: './src/manifest.json' },
      { context: './src/assets', from: 'icon-**', to: 'assets' }
    ]),
      new WebpackNotifierPlugin({alwaysNotify: true})
  ]
}