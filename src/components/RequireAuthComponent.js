'use strict';

import React from 'react';
import { Router } from 'react-router';

require('styles//RequireAuth.scss');

// Libraries
var Rebase = require('re-base');

// Configure Firebase
var base = Rebase.createClass('https://incandescent-torch-8885.firebaseio.com/');

class RequireAuthComponent extends React.Component {

  constructor(props) {
    super(props);

    let login = localStorage.getItem('auth');

    // No login data? Go to login.
    if(!login) {
      window.location.href = '/#/login';
    }

    login = JSON.parse(login);

    try {
      base.fetch('users', {
        context: this,
        asArray: true,
        queries: {
          orderByChild: 'id',
          equalTo: login.id
        },
        then(data){
          // Not in the database? Go to login.
          if(data.length === 0) {
            window.location.href = '/#/login';
          }
        }
      });
    } catch(e) {
      console.log('trycatch', e);
      // Holy moly, no users whatsoever. Definitely go to login.
      window.location.href = '/#/login';
    }
  }

}

RequireAuthComponent.displayName = 'RequireAuthComponent';

// Uncomment properties you need
// RequireAuthComponent.propTypes = {};
// RequireAuthComponent.defaultProps = {};

export default RequireAuthComponent;
