const path = require('path');

module.exports = {
  entry: './src/delphiParser-plugin.js',
  output: {
    filename: 'delphiParser-plugin.webpack.js',
    path: path.resolve(__dirname, 'dist'),
  },
};