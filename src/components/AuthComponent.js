'use strict';

import React from 'react';

// Libraries
var Rebase = require('re-base');

// Configure Firebase
var base = Rebase.createClass('https://incandescent-torch-8885.firebaseio.com/');

require('styles//Auth.scss');

class AuthComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      auth: false,
      name: ''
    };
  }

  componentWillMount() {
    base.fetch('users', {
      context: this,
      asArray: true,
      queries: {
        orderByChild: 'id',
        equalTo: this.props.params.user
      },
      then(data){
        this.setState({
          auth: data[0]
        });

        if(typeof data[0].email !== 'undefined') {
          let authData = {
            id: data[0].id,
            accountId: data[0].account.account_id,
            name: data[0].name,
            email: data[0].email
          };

          window.localStorage.setItem('auth', JSON.stringify(authData));
          window.location.href = '/#/dashboard';
          return;
        }

        if(typeof data[0].account.desc !== 'undefined') {
          this.setState({
            name: data[0].account.desc
          });
        }
      }
    });
  }

  submitData(event) {
    let data = {
      name: event.target.name.value,
      email: event.target.email.value
    };

    let stateKey = this.state.auth.key;

    base.post('users/' + stateKey + '/name', {
      data: data.name,
      then(){

        base.post('users/' + stateKey + '/email', {
          data: data.email,
          then(){

            let authData = {
              id: this.state.auth.id,
              accountId: this.state.auth.account.account_id,
              name: this.state.auth.name,
              email: this.state.auth.email
            };

            window.localStorage.setItem('auth', JSON.stringify(authData));
            window.location.href = '/#/dashboard';

          }
        });

      }
    });
  }

  handleChange(event) {
    this.setState({
      name: event.target.value
    });
  }

  render() {
    if(this.state.auth) {
      return (
        <div className="auth-component">
          <h1>You're connected to TeamCash</h1>
          <h4>We just need a few more details to tailor your experience...</h4>

          <form ref="form" onSubmit={this.submitData.bind(this)}>
            <label htmlFor="name">Your name</label>
            <input type="text" required id="name" value={this.state.name} onChange={this.handleChange.bind(this)} placeholder="Donald Trump" />

            <label htmlFor="email">Your email address</label>
            <input type="email" required id="email" placeholder="donald.trump@whitehouse.gov" />

            <input type="submit" value="Save" className="button" />
          </form>

        </div>
        );
    } else {
      return (
        <div className="auth-component">
          <h1>Finding user...</h1>
        </div>
        );
    }
  }

}

AuthComponent.displayName = 'AuthComponent';

// Uncomment properties you need
// AuthComponent.propTypes = {};
// AuthComponent.defaultProps = {};

export default AuthComponent;
