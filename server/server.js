var http = require('http');
var port = 8080;


// Parse POST body arguments
function parseArgs(data) {
  var args = {}

  var parts = data.split('&');
  parts.forEach(function(part, i){
    var key = part.split('=')[0];
    var value = part.split('=')[1];
    args[key] = decodeURIComponent(value);
  });

  return args;
}


// The server to run
var server = http.createServer(function(req, res){
  console.log('Received request via ' + req.method);

  // Slack commands are sent via POST
  if (req.method == 'POST') {
    var data = '';

    req.on('data', function(chunk){
      data += chunk.toString();
    });

    req.on('end', function(){
      var args = parseArgs(data);
      
      // Do some stuff
    });

  }
  
  // If we receive something not via POST
  else { 
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end('Boo!\n');
  }
});


// Go
server.listen(port, function(){
  console.log('Listening on localhost at port ' + port);
});
