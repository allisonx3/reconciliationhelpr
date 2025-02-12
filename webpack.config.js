const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'), // Build files go to /dist
    filename: 'bundle.js',
    publicPath: '/', // Serve files from root
  },

  // Define rules for how to handle different file types
  module: {
    rules: [
      // Process JS & JSX files with babel-loader
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      // Process CSS files with style-loader & css-loader
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  // Define plugins
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',  // Uses HTML page as a template
    }),
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Serve static files from /public
    },
    port: 3000, // Run on port 3000
    hot: true, // Enable hot module replacement
    historyApiFallback: true, // Handle client-side routing
    client: {
      overlay: {
        errors: false, // doesn't show errors as overlay in the browser 
        warnings: false // Doesn't show warnings as overlay in the browser

      }
    },
  },

  // Define how to resolve file extensions
  resolve: {
    extensions: ['.js', '.jsx'],
  },

  // Source map generation for debugging
  devtool: 'source-map', 
};