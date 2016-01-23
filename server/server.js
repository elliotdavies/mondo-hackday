'use strict';

// Node HTTP libs
const http = require('http');
const url_lib = require('url');
const request = require('request');

// Keys and secrets
const auth = require('./auth.json');
const client_id = auth.client_id;
const client_secret = auth.client_secret

// Firebase database
const Firebase = require("firebase");
const firebase = new Firebase('https://incandescent-torch-8885.firebaseio.com/');
const firebaseUsers = firebase.child('users');
const firebaseTransactions = firebase.child('transactions');

// Server config
const port = 8080;
const path = '0.0.0.0';

// Mondo auth
const state = 'stategoeshere';
const redirect_uri = `http://${path}:${port}/auth/callback`;
const mondo_auth_url = `https://auth.getmondo.co.uk/?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}`;
const mondo_auth_url2_host = `https://api.getmondo.co.uk/oauth2/token`;


// Helper function to parse arguments
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

  // GET for e.g. auth requests
  if (req.method === 'GET') {
    
    // Turn the URL into an object
    let url = url_lib.parse(req.url);

    // Where did the user visit?
    switch (url.pathname) {

      // Initial auth request
      case '/auth/':
      case '/auth':
        console.log('User visited /auth - redirecting to Mondo...');
        res.writeHead(302, {
          'Location': mondo_auth_url
        });
        res.end();
        break;
      // Secondary auth request
      case '/auth/callback':
        console.log('Received Mondo auth callback...')
        let args = parseArgs(url.query);
        
        // Pretend we're checking the validity of the callback
        if (args.state === state) {
          console.log('Redirecting to Mondo again...');

          // Fire off data to Mondo
          request.post({
            url: mondo_auth_url2_host,
            form: {
              grant_type: 'authorization_code',
              client_id: client_id,
              client_secret: client_secret,
              redirect_uri: redirect_uri,
              code: args.code
            }
          },
          function(err, res, body){
            if (err) console.log('ERROR: ' + err);
            // Do something with the access token we get back
            else {
              body = JSON.parse(body);
              let newUser = firebaseUsers.push();
              newUser.set({
                id: body.user_id,
                access_token: body.access_token
              });
            }
          });
        }
        break;
      // Just ignore this
      case '/favicon.ico':
        break;
      // Default
      default:
        console.log(`No action found for URL ${url.pathname}`);
        break;
    }
  }


  // POST for e.g. transaction notifications
  if (req.method === 'POST') {
    let data = '';

    req.on('data', (chunk) => { data += chunk.toString(); });
    req.on('end', function(){
      let args = parseArgs(data);
      
      // Do some stuff
      console.log(data, args)
    });

  }
  
  // If we receive anything else
  else { 
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end('Boo!\n');
  }
});


// Go
server.listen(port, path, function(){
  console.log(`Listening on ${path} at port ${port}`);
});
