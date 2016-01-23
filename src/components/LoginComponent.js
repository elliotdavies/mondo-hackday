'use strict';

import React from 'react';

let mondoLoginImage = require('../images/mondo-login.png');

require('styles//Login.scss');

class LoginComponent extends React.Component {
  render() {
    return (
      <div className="login-component">
        <h1>Join TeamCash</h1>
        <h4>A smart spending tracker for small teams and businesses, built with Mondo</h4>
        <a href="http://192.168.42.12:8080/auth">
          <img src={mondoLoginImage} />
        </a>
      </div>
    );
  }
}

LoginComponent.displayName = 'LoginComponent';

// Uncomment properties you need
// LoginComponent.propTypes = {};
// LoginComponent.defaultProps = {};

export default LoginComponent;
