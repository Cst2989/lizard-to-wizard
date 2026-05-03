const HtmlWebpackPlugin = require('html-webpack-plugin');
const { container } = require('webpack');
const path = require('path');

module.exports = {
  context: __dirname,
  entry: './src/index.tsx',
  mode: 'development',
  devServer: {
    port: 3000,
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
      name: 'shell',
      remotes: {
        products: 'products@http://localhost:5001/remoteEntry.js',
        orders: 'orders@http://localhost:5002/remoteEntry.js',
        dashboard: 'dashboard@http://localhost:5003/remoteEntry.js',
        users: 'users@http://localhost:5004/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          strictVersion: false,
          eager: false,
        },
        'react-dom': {
          singleton: true,
          strictVersion: false,
          eager: false,
        },
        'react-router-dom': {
          singleton: true,
          strictVersion: false,
          eager: false,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
};
