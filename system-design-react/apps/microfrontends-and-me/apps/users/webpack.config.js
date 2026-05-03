const HtmlWebpackPlugin = require('html-webpack-plugin');
const { container } = require('webpack');
const path = require('path');

module.exports = {
  context: __dirname,
  entry: './src/index.tsx',
  mode: 'development',
  devServer: {
    port: 5004,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  output: {
    publicPath: 'auto',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
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
  plugins: [
    new container.ModuleFederationPlugin({
      name: 'users',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: {
        react: {
          singleton: true,
          strictVersion: false,
        },
        'react-dom': {
          singleton: true,
          strictVersion: false,
        },
        'react-router-dom': {
          singleton: true,
          strictVersion: false,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
};
