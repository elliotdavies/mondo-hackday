'use strict';

import React from 'react';
import RequireAuthComponent from './RequireAuthComponent';

import UserTransactionComponent from './UserTransactionComponent';

import moment from 'moment';

require('styles//Print.scss');

class PrintComponent extends RequireAuthComponent {
  constructor(props) {
    super(props);

    this.state = {
      transactions: [],
      outgoing: false,
      user: false
    }
  }

  componentDidMount() {
    this.base.fetch('users', {
      context: this,
      asArray: true,
      queries: {
        orderByChild: 'id',
        equalTo: this.props.params.id
      },
      then(data){
        this.setState({
          user: data[0]
        });

        this.userTransactionsBind = this.base.bindToState('recent/' + this.state.user.id, {
          context: this,
          state: 'transactions',
        });

        this.outgoingBind = this.base.bindToState('totals/' + this.state.user.id + '/outgoing', {
          context: this,
          state: 'outgoing',
        });
      }
    });
  }

  componentWillUnmount() {
    this.base.removeBinding(this.outgoingBind);
    this.base.removeBinding(this.userTransactionsBind);
  }

  render() {
    if(this.state.user && this.state.outgoing) {
      return (
        <div className="print-component">
          <div className="print__container">
            <header>
              <aside>
                <h1>TeamCash report for {this.state.user.name}</h1>
                <span className="print__date">From {moment().subtract(7, 'days').format('D MMMM')} to {moment().format('D MMMM YYYY')}</span>
                <p>Email: {this.state.user.email}</p>
                <em>Weekly spend: £{(this.state.outgoing/100).toFixed(2)}</em>

              </aside>
            </header>

            <hr />

            <h2>Transactions</h2>

            <ul className="user__transactions">

              {this.state.transactions.reverse().map(function(transaction, key) {
                return (<UserTransactionComponent transaction={transaction} key={key} />);
              }.bind(this))}

            </ul>


            <main>
              <h2>Manager signature: _____________________</h2>

              <h2>{this.state.user.name} signature: _____________________</h2>
            </main>
          </div>
        </div>
      );
    } else {
      return(
        <div>Loading...</div>
      );
    }
  }
}

PrintComponent.displayName = 'PrintComponent';

// Uncomment properties you need
// PrintComponent.propTypes = {};
// PrintComponent.defaultProps = {};

export default PrintComponent;
