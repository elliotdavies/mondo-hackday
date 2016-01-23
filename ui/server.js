/*eslint no-console:0 */
require('core-js/fn/object/assign');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var open = require('open');

new WebpackDevServer(webpack(config), config.devServer)
.listen(config.port, '0.0.0.0', function(err) {
  if (err) {
    console.log(err);
  }
  console.log('Listening at 0.0.0.0:' + config.port);
  console.log('Opening your system browser...');
  open('http://0.0.0.0:' + config.port + '/');
});
