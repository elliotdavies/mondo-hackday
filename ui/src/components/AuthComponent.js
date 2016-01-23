'use strict';

import React from 'react';

// Libraries
var Rebase = require('re-base');

// Configure Firebase
var base = Rebase.createClass('https://incandescent-torch-8885.firebaseio.com/');

require('styles//Auth.scss');

class AuthComponent extends React.Component {

  componentWillMount() {
    base.fetch('users', {
      context: this,
      asArray: true,
      queries: {
        orderByChild: 'id',
        equalTo: this.props.params.user
      },
      then(data){
        let authData = {
          id: data[0].id,
          accountId: data[0].account.account_id,
          name: data[0].account.desc
        };
        window.localStorage.setItem('auth', JSON.stringify(authData));
        window.location.href = '/#/dashboard';
      }
    });
  }

  render() {
    return (
      <div>
        <h1>Logging you in to TeamCash...</h1>
      </div>
      );
  }

}

AuthComponent.displayName = 'AuthComponent';

// Uncomment properties you need
// AuthComponent.propTypes = {};
// AuthComponent.defaultProps = {};

export default AuthComponent;
