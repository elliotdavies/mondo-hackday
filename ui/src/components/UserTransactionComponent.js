'use strict';

import React from 'react';

import FontAwesome from 'react-fontawesome';

require('styles//UserTransaction.scss');

class UserTransactionComponent extends React.Component {
  render() {
    return (
      <li className="usertransaction-component">
        <h3>{this.props.transaction.name}</h3>

        <button>
          <FontAwesome name="calendar" />
        </button>
      </li>
    );
  }
}

UserTransactionComponent.displayName = 'UserTransactionComponent';

// Uncomment properties you need
// UserTransactionComponent.propTypes = {};
// UserTransactionComponent.defaultProps = {};

export default UserTransactionComponent;
