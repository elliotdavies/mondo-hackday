'use strict';

import React from 'react';

require('styles//DashboardTransaction.scss');

class DashboardTransactionComponent extends React.Component {
  render() {
    let labelClass = 'label label--money label--positive';
    let value = this.props.transaction.local_amount/100;
    if(value < 0) {
      labelClass = 'label label--money label--negative';
      value = value*-1;
    }

    let currency = this.props.transaction.local_currency;
    switch(this.props.transaction.local_currency) {
      case 'GBP':
        currency = '£';
        break;
    }

    return (
      <li className="dashboardtransaction-component">
        <h4>{this.props.transaction.description} <small>by {this.props.transaction.name}</small></h4>
        <span className={labelClass}>{currency}{value.toFixed(2)}</span>
      </li>
    );
  }
}

DashboardTransactionComponent.displayName = 'DashboardTransactionComponent';

// Uncomment properties you need
// DashboardTransactionComponent.propTypes = {};
// DashboardTransactionComponent.defaultProps = {};

export default DashboardTransactionComponent;
