'use strict';

import React from 'react';

import moment from 'moment';

import FontAwesome from 'react-fontawesome';

require('styles//UserTransaction.scss');

class UserTransactionComponent extends React.Component {
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

    let notes;
    if(this.props.transaction.notes !== '') {
      notes = (<blockquote>{this.props.transaction.notes}</blockquote>);
    }

    return (
      <li className="usertransaction-component">
        <div className="transaction__meta">
          <span className={'icon icon--' + this.props.transaction.category}></span>
          <h3>{this.props.transaction.description}</h3>
          <span className={labelClass}>{currency}{value.toFixed(2)}</span> on <span>{moment(this.props.transaction.created).format('D MMMM [at] h:mma')}</span>

          {notes}
        </div>

        <div className="transaction__actions">
          <button>
            <FontAwesome name="calendar" /> Attach event
          </button>
          <button>
            <FontAwesome name="flag" /> Flag
          </button>
        </div>
      </li>
    );
  }
}

UserTransactionComponent.displayName = 'UserTransactionComponent';

// Uncomment properties you need
// UserTransactionComponent.propTypes = {};
// UserTransactionComponent.defaultProps = {};

export default UserTransactionComponent;
