'use strict';

import React from 'react';
import UserTransactionComponent from './UserTransactionComponent';
import RequireAuthComponent from './RequireAuthComponent';

require('styles//User.scss');

class UserComponent extends RequireAuthComponent {
  constructor(props) {
    super(props);

    this.state = {
      transactions: [
        {
          name: 'My transaction'
        },
        {
          name: 'My transaction 2'
        },
        {
          name: 'My transaction 3'
        },
        {
          name: 'My transaction 4'
        },
        {
          name: 'My transaction 5'
        }
      ],
      user: {
        id: 1,
        name: 'Chris Hutchinson',
        email: 'hello@chrishutchinson.me',
        avatar: 'https://pbs.twimg.com/profile_images/482607943071039488/vcujIxUA.jpeg',
        spending: 409.31
      }
    }
  }

  componentDidMount() {
    window.console.log(this.props.params);
  }

  render() {
    return (
      <div className="user-component">
        <header>
          <img src={this.state.user.avatar} />

          <aside>
            <h1>{this.state.user.name}</h1>
            <p>{this.state.user.email}</p>

            <div className="buttons">
              <button>Print report</button>
              <button>Print report</button>
            </div>
          </aside>
        </header>

        <hr />

        <h2>Recent transactions</h2>

        <ul className="user__transactions">

          {this.state.transactions.map(function(transaction, key) {
            return (<UserTransactionComponent transaction={transaction} key={key} />);
          }.bind(this))}

        </ul>
      </div>
    );
  }
}

UserComponent.displayName = 'UserComponent';

// Uncomment properties you need
// UserComponent.propTypes = {};
// UserComponent.defaultProps = {};

export default UserComponent;
