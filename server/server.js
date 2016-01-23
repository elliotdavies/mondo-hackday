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
const redirect_uri_base = `http://${path}:${port}`;


/**
 * Helper function to parse arguments
 */
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


/**
 * Initial auth request
 */
function handleAuth(res) {
  console.log('User visited /auth - redirecting to Mondo...');

  const mondo_auth_url = `https://auth.getmondo.co.uk/?client_id=${client_id}&redirect_uri=${redirect_uri_base}/auth/callback&response_type=code&state=${state}`;

  res.writeHead(302, {
    'Location': mondo_auth_url
  });
  res.end();
}


/**
 * Secondary auth request (callback)
 */
function handleAuthCallback(url, res) {
  console.log('Received Mondo auth callback...')
  let args = parseArgs(url.query);

  // Pretend we're checking the validity of the callback
  if (args.state === state) {
    console.log('Redirecting to Mondo again...');

    const mondo_auth_url2_host = 'https://api.getmondo.co.uk/oauth2/token';

    // Fire off data to Mondo
    request.post({
      url: mondo_auth_url2_host,
      form: {
        grant_type: 'authorization_code',
        client_id: client_id,
        client_secret: client_secret,
        redirect_uri: redirect_uri_base + '/auth/callback',
        code: args.code
      }
    },
    function(err, response, body){
      if (err) console.log('ERROR: ' + err);
      else {
        body = JSON.parse(body);

        // Fetch the user's account ID
        request.get(
          'https://api.getmondo.co.uk/accounts',
          {
            'auth': {
              'bearer': body.access_token
            }
          },
          function(err, acc_res, acc_body) {
            acc_body = (JSON.parse(acc_body)).accounts[0];

            let newUser = firebaseUsers.push();
            newUser.set({
              id: body.user_id,
              access_token: body.access_token,
              account: {
                account_id: acc_body.id,
                account_no: acc_body.account_number,
                desc: acc_body.description
              }
            });

            // Redirect the user to another page
            res.writeHead(302, {
              'Location': '/registered'
            });
            res.end();
          }
        );
      }
    });
  }
}


/**
 * New user registers
 */
function handleRegistration(res) {
  console.log('New user registered!')
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end('Gotcha!\n');
}


/**
 * Incoming webhooks
 */
function handleWebhook(args) {
  console.log('Received webhook data:', args);
}


// The server to run
let server = http.createServer(function(req, res){
  console.log('Received request via ' + req.method);

  // Turn the URL into an object
  let url = url_lib.parse(req.url);

  // GET for e.g. auth requests
  if (req.method === 'GET') {
    switch (url.pathname) {
      // Initial auth request
      case '/auth/':
      case '/auth':
        handleAuth(res);
        break;
      // Secondary auth request
      case '/auth/callback':
        handleAuthCallback(url, res);
        break;
      // New user
      case '/registered':
        handleRegistration(res);
        break;
      // Just ignore this
      case '/favicon.ico':
        break;
      // Default
      default:
        console.log(`No action found for URL ${url.pathname} via GET`);
        break;
    }
  }
  // POST for e.g. transaction notifications
  else if (req.method === 'POST') {
    // Wait for all the data
    let data = '';
    req.on('data', (chunk) => { data += chunk.toString(); });
    req.on('end', function(){
      let args = parseArgs(data);
      
      // Then redirect
      switch (url.pathname) {
        // Incoming webhooks
        case '/webhook':
          handleWebhook(args);
          break;
        // Default
        default:
          console.log(`No action found for URL ${url.pathname} via POST`);
          break;
      }
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
