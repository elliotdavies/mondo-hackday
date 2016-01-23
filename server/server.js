const http = require('http');
const port = 8080;
const path = '0.0.0.0';


// Parse POST body arguments
function parseArgs(data) {
  let args = {}

  let parts = data.split('&');
  parts.forEach((part, i) => {
    let key = part.split('=')[0];
    let value = part.split('=')[1];
    args[key] = decodeURIComponent(value);
  });

  return args;
}


// The server to run
let server = http.createServer(function(req, res){
  console.log('Received request via ' + req.method);

  // Slack commands are sent via POST
  if (req.method == 'POST') {
    let data = '';

    req.on('data', function(chunk){
      data += chunk.toString();
    });

    req.on('end', function(){
      let args = parseArgs(data);
      
      // Do some stuff
      console.log(data, args)
    });

  }
  
  // If we receive something not via POST
  else { 
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end('Boo!\n');
  }
});


// Go
server.listen(port, path, function(){
  console.log(`Listening on ${path} at port ${port}`);
});
