'use strict';

// Node HTTP libs
const http = require('http');
const urlLib = require('url');
const request = require('request');

// Keys and secrets
const auth = require('./auth.json');
const clientId = auth.client_id;
const clientSecret = auth.client_secret

// Firebase database
const Firebase = require("firebase");
const firebase = new Firebase('https://incandescent-torch-8885.firebaseio.com/');
const firebaseUsers = firebase.child('users');
const firebaseRecents = firebase.child('recent');
const firebaseTotals = firebase.child('totals');

// Server config
const port = 8080;
const path = '0.0.0.0';

// Mondo auth
const state = 'stategoeshere';
const redirectUriBase = `http://${path}:${port}`;


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
  const mondoAuthUrl = `https://auth.getmondo.co.uk/?client_id=${clientId}&redirect_uri=${redirectUriBase}/auth/callback&response_type=code&state=${state}`;
  res.writeHead(302, {
    'Location': mondoAuthUrl
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

    const mondoAuthUrl2Host = 'https://api.getmondo.co.uk/oauth2/token';

    // Fire off data to Mondo
    request.post({
      url: mondoAuthUrl2Host,
      form: {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUriBase + '/auth/callback',
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
          function(err, accRes, accBody) {
            accBody = (JSON.parse(accBody)).accounts[0];

            // Check if user already exists in the database
            firebaseUsers.once('value', function(data){
              data = data.val();

              let matchingUsers = [];
              if (data) {
                matchingUsers = Object.keys(data).filter(d => {
                  return data[d].id === body.user_id;
                });
              }

              // Store information in the database if not
              if (matchingUsers.length === 0) {
                let newUser = firebaseUsers.push();
                newUser.set({
                  id: body.user_id,
                  access_token: body.access_token,
                  account: {
                    account_id: accBody.id,
                    account_no: accBody.account_number,
                    desc: accBody.description
                  }
                });
              }

              // Redirect the user to another page
              res.writeHead(302, {
                'Location': '/registered'
              });
              res.end();
            })
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

  // Update database on each webhook
}


/**
 * Fetch all user IDs currently stored in the database
 */
function fetchUserIds(fn) {
  firebaseUsers.once('value', function(data) {
    data = data.val();
    let ids = Object.keys(data).map(d => {
      return {
        u_id: data[d].id,
        token: data[d].access_token,
        acc_id: data[d].account.account_id,
        name: data[d].name
      }
    });
    fn(ids); // Use callback to access this data elsewhere
  });
}


/**
 * Update the database with the most recent transactions for a team and its users
 */
function updateRecentTransactions(ids) {
  console.log('Updating recent transactions');

  let counter = ids.length - 1;
  let teamTransactions = [];

  ids.forEach(id => {
    request(`https://api.getmondo.co.uk/transactions?account_id=${id.acc_id}&limit=10`,
    {
      'auth': {
        'bearer': id.token
      }
    },
    function(err, res, body) {
      let transactions = (JSON.parse(body)).transactions;
      let transactionsWithMeta = transactions.map(t => {
        return Object.assign(t, {
          name: id.name // Add further details to the transaction object
        });
      });

      transactionsWithMeta.forEach(t => teamTransactions.push(t));
      firebaseRecents.child(id.u_id).set(transactionsWithMeta);

      // PLEASE FIX PROPERLY IN FUTURE: This means all async functions have returned
      if (counter-- === 0) {
        let topTen = teamTransactions.sort((a, b) => a.created - b.created).slice(0, 9);
        firebaseRecents.child('team').set(topTen);
      }
    });
  });
}


/**
 * Update the database with some total figures for a team and its users
 */
function updateTotals(ids) {
  console.log('Updating totals');

  let counter = ids.length - 1;
  let totalIncoming = 0;
  let totalOutgoing = 0;

  let weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  let weekAgoStr = weekAgo.toISOString();

  ids.forEach(id => {
    request(`https://api.getmondo.co.uk/transactions?account_id=${id.acc_id}&since=${weekAgoStr}`,
    {
      'auth': {
        'bearer': id.token
      }
    },
    function(err, res, body) {
      let transactions = (JSON.parse(body)).transactions;
      
      let incoming = transactions.filter(t => t.amount >= 0).reduce((total, t) => { return total + t.amount }, 0);
      let outgoing = transactions.filter(t => t.amount < 0).reduce((total, t) => { return total + t.amount }, 0);

      firebaseTotals.child(id.u_id).set({
        incoming: incoming, 
        outgoing: abs(outgoing)
      });

      totalIncoming += incoming;
      totalOutgoing += outgoing;

      // PLEASE FIX PROPERLY IN FUTURE: This means all async functions have returned
      if (counter-- === 0) {
        firebaseTotals.child('team').set({
          incoming: totalIncoming,
          outgoing: abs(totalOutgoing)
        });
      }
    });
  });
}


// The server to run
let server = http.createServer(function(req, res){
  console.log('Received request via ' + req.method);

  // Turn the URL into an object
  let url = urlLib.parse(req.url);

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
      // Manually force database updates
      case '/update/':
      case '/update':
        fetchUserIds(ids => {
          updateTotals(ids);
          updateRecentTransactions(ids);
        });
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
