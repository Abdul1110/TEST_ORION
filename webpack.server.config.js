const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: { server: './server/main.ts' },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      hiredis: path.join(__dirname, 'server/aliases/hiredis.js')
    }
  },
  target: 'node',
  mode: 'none',
  // this makes sure we include node_modules and other 3rd party libraries
  externals: [/(node_modules|main\..*\.js)/],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    noParse: [/dtrace.js$/, /serializer.js$/],
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: [path.resolve(__dirname, 'src/git.version.ts')]
      },
      {
        // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
        // Removing this will cause deprecation warnings to appear.
        test: /(\\|\/)@angular(\\|\/)core(\\|\/).+\.js$/,
        parser: { system: true }
      }
    ]
  },
  optimization: {
    minimize: false
  },
  plugins: [
    // TODO: remove these after nestjs has been fixed
    new webpack.IgnorePlugin(/node-gyp/),
    new webpack.IgnorePlugin(/cache-manager/),
    new webpack.IgnorePlugin(/class-transformer/),
    new webpack.IgnorePlugin(/class-validator/),
    new webpack.IgnorePlugin(/type-graphql/),
    new webpack.IgnorePlugin(/@nestjs\/microservices/),
    new webpack.IgnorePlugin(/@nestjs\/websockets\/socket-module/),
    new webpack.IgnorePlugin(/fastify-swagger/),
    // End TODO
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    // Temporary Fix for issue: https://github.com/angular/angular/issues/11580
    // for 'WARNING Critical dependency: the request of a dependency is an expression'
    new webpack.ContextReplacementPlugin(
      /(.+)?angular(\\|\/)core(.+)?/,
      path.join(__dirname, 'src'), // location of your src
      {} // a map of your routes
    ),
    new webpack.ContextReplacementPlugin(/(.+)?express(\\|\/)(.+)?/, path.join(__dirname, 'src'), {}),
    new webpack.DefinePlugin({ 'global.GENTLY': false })
  ]
};
