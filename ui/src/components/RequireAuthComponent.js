'use strict';

import React from 'react';
import { Router } from 'react-router';

require('styles//RequireAuth.scss');

class RequireAuthComponent extends React.Component {

  constructor(props) {
    super(props);

    let login = localStorage.getItem('auth');
    console.log(login);
    if(!login) {
      window.location.href = '/#/login';
    }
  }

}

RequireAuthComponent.displayName = 'RequireAuthComponent';

// Uncomment properties you need
// RequireAuthComponent.propTypes = {};
// RequireAuthComponent.defaultProps = {};

export default RequireAuthComponent;
