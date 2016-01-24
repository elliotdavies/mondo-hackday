'use strict';

// Node HTTP libs
const http = require('http');
const urlLib = require('url');
const request = require('request');
const fs = require('fs');

// Config, keys and secrets
const config = require('./config.json');
const clientId = config.client_id;
const clientSecret = config.client_secret
const port = config.port;
const path = config.server;
const authUrl = ((config.is_prod) ? config.auth_url : config.staging_auth_url);
const apiUrl = ((config.is_prod) ? config.api_url : config.staging_api_url);

// Firebase database
const Firebase = require("firebase");
const firebase = new Firebase(config.database);
const firebaseUsers = firebase.child('users');
const firebaseRecents = firebase.child('recent');
const firebaseTotals = firebase.child('totals');


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
  const mondoAuthUrl = `${authUrl}/?client_id=${clientId}&redirect_uri=${redirectUriBase}/auth/callback&response_type=code&state=${state}`;
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

    const mondoAuthUrl2Host = `${apiUrl}/oauth2/token`;

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
    function(authErr, authRes, authBody){
      if (authErr) console.log('ERROR: ' + authErr);
      else {
        authBody = JSON.parse(authBody);

        // Fetch the user's account ID
        request.get(
          `${apiUrl}/accounts`,
          {
            'auth': {
              'bearer': authBody.access_token
            }
          },
          function(accErr, accRes, accBody) {
            accBody = (JSON.parse(accBody)).accounts[0];

            // Check if user already exists in the database
            firebaseUsers.once('value', function(data){
              data = data.val();

              let matchingUsers = [];
              if (data) {
                matchingUsers = Object.keys(data).filter(d => {
                  return data[d].id === authBody.user_id;
                });
              }

              // Store information in the database if not
              if (matchingUsers.length === 0) {
                let newUser = firebaseUsers.push();
                newUser.set({
                  id: authBody.user_id,
                  access_token: authBody.access_token,
                  account: {
                    account_id: accBody.id,
                    account_no: accBody.account_number,
                    desc: accBody.description
                  },
                  name: '',
                  email: ''
                });

                // Does this user already have a webhook set up?
                request(`${apiUrl}/webhooks?account_id=${accBody.id}`,
                {
                  'auth': {
                    'bearer': authBody.access_token
                  },
                },
                function(webhookErr, webhookRes, webhookBody) {
                  webhookBody = JSON.parse(webhookBody);

                  // If so, do nothing
                  if (!webhookBody.webhooks) {
                    console.log('Error checking webhooks');
                    return;
                  }
                  else if (webhookBody.webhooks.length > 0) {
                    console.log('Webhook already registered for this user');
                    return;
                  }

                  // If not, create one
                  request.post({
                    url: `${apiUrl}/webhooks`,
                    'auth': {
                      'bearer': authBody.access_token
                    },
                    form: {
                      account_id: accBody.id,
                      url: redirectUriBase + '/webhook'
                    }
                  },
                  function(createWHErr, createWHRes, createWHBody) {
                    console.log(createWHBody);
                    if (createWHErr) console.log('Error registering webhook');
                    else console.log('Webhook registered successfully');
                  });
                });
              }

              // Redirect the user elsewhere
              res.writeHead(302, {
                'Location': `/#/auth/${authBody.user_id}`
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
 * Incoming webhooks
 */
function handleWebhook(args) {
  console.log('Received webhook data:', args);

  // Update database on each webhook received
  // fetchUserIds(ids => {
  //   updateTotals(ids);
  //   updateRecentTransactions(ids);
  // });
}


/**
 * Messages to pass along to a user
 */
function handleMessage(res, data) {
  console.log('Received message data');

  data = JSON.parse(Object.keys(data)[0]);

  firebaseUsers.once('value', function(users){
    users = users.val();

    let userToken = (Object.keys(users))
      .filter(u => users[u].account.account_id == data.accountId)
      .map(u => users[u].access_token)[0];

    request.post({
      url: `${apiUrl}/feed`,
      'auth': {
        'bearer': userToken
      },
      form: {
        account_id: data.accountId,
        type: 'basic',
        'params[title]': data.title,
        'params[body]': data.message,
        // 'params[background_color]': '#FCF1EE',
        // 'params[body_color]': '#FFFFFF",
        // 'params[title_color]': '#333',
        'params[image_url]': 'http://www.nyan.cat/cats/original.gif'
      }
    },
    function(err, MondoRes, MondoData){
      if (!err && MondoRes.statusCode === 200) {
        console.log('Successfully posted to user\'s feed');
        res.writeHead(200, {'Content-Type':'text/plain'});
        res.end('Success');
      } else {
        console.log('Error posting to user\'s feed');
        res.writeHead(418, {'Content-Type':'text/plain'});
        res.end('Fail');
      }
    });
  });
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
    request(`${apiUrl}/transactions?account_id=${id.acc_id}&limit=10`,
    {
      'auth': {
        'bearer': id.token
      }
    },
    function(err, res, body) {
      let transactions = (JSON.parse(body)).transactions;

      if (!transactions) {
        console.log('Error updating recent transactions:', err);
        console.log('Tried to use id: ' + JSON.stringify(id) + ' and received data: ' + body);
        return;
      }

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
    request(`${apiUrl}/transactions?account_id=${id.acc_id}&since=${weekAgoStr}`,
    {
      'auth': {
        'bearer': id.token
      }
    },
    function(err, res, body) {
      let transactions = (JSON.parse(body)).transactions;

      if (!transactions) {
        console.log('Error updating total transactions:', err);
        console.log('Tried to use id: ' + JSON.stringify(id) + ' and received data: ' + body);
        return;
      }

      let incoming = transactions.filter(t => t.amount >= 0).reduce((total, t) => { return total + t.amount }, 0);
      let outgoing = transactions.filter(t => t.amount < 0).reduce((total, t) => { return total + t.amount }, 0);

      firebaseTotals.child(id.u_id).set({
        incoming: incoming,
        outgoing: Math.abs(outgoing)
      });

      totalIncoming += incoming;
      totalOutgoing += outgoing;

      // PLEASE FIX PROPERLY IN FUTURE: This means all async functions have returned
      if (counter-- === 0) {
        firebaseTotals.child('team').set({
          incoming: totalIncoming,
          outgoing: Math.abs(totalOutgoing)
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
      // Manually force database updates
      case '/update/':
      case '/update':
        fetchUserIds(ids => {
          updateTotals(ids);
          updateRecentTransactions(ids);
        });
        break;
      // Default
      case '/':
        url.pathname = '/index.html';
        // Redirect the user to the login page
        // res.writeHead(302, {
        //   'Location': '/#/login'
        // });
        // res.end();
      default:
        fs.stat('dist' + url.pathname, function(err, stat){
          if (err === null) {
            fs.readFile('dist' + url.pathname, function(err, contents){
              res.end(contents);
            });
          }
          else console.log(err)
        })
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
        case '/message':
          handleMessage(res, args);
          break;
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
