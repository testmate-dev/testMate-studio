// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

const path = require('path')
//const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  context: path.resolve(__dirname, 'src'),
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  mode: isProduction ? 'production' : 'development',
  entry: {
    background: ['./background'],
    record: ['./content'],
    ui: ['./ui/main.js'],
  },
  output: {
    path: path.resolve(__dirname, 'build/assets'),
    filename: '[name].js',
    publicPath: '/assets/',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.js', '.json', '.vue'],
    alias: {
      vue$: 'vue/dist/vue.runtime.esm-bundler.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // Process JS with Babel.
          {
            test: /\.(js)$/,
            include: [path.resolve(__dirname, 'src')],
            use: [
              {
                loader: 'babel-loader',
                options: {
                  compact: true,
                },
              },
            ],
          },
          {
            test: /\.(png|jpe?g|gif|svg|ico|webp|woff2?|eot|ttf|otf)$/i,
            type: 'asset/resource',
            generator: {
              filename: 'media/[name].[hash:8][ext]',
            },
          },
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ],
      },
    ],
  },
  plugins: [].concat([
    new VueLoaderPlugin(),
    // Copy non-umd assets to vendor
    new CopyWebpackPlugin({
      patterns: [
        { from: 'background/config.js', to: './' },
        { from: 'content/prompt.js', to: './' },
        { from: 'content/highlight.css', to: './' },
        { from: 'ui/ui.html', to: '../ui.html' },
        { from: 'manifest.json', to: '../' },
        { from: 'icons', to: '../icons' },
      ],
    }),
    // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
    /*new ExtractTextPlugin({
      filename: 'css/[name].[hash:8].css',
    }),*/
  ]),
}
