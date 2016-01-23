require('normalize.css');
require('styles/App.css');

// Libraries
import React from 'react';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';

// Styles
require('styles//Main.scss');

// Libraries
var Rebase = require('re-base');

// Configure Firebase
var base = Rebase.createClass('https://incandescent-torch-8885.firebaseio.com/');

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      transactions: [],
      data: {
        totalSpend: 0
      }
    };
  }

  componentDidMount(){
    base.syncState('users', {
      context: this,
      state: 'users',
      asArray: true
    });

    base.syncState('transactions', {
      context: this,
      state: 'transactions',
      asArray: true
    });
  }

/*  addItem(){
    let newItem = {name: 'Cheese'};

    this.setState({
      items: this.state.items.concat([newItem]) //updates Firebase and the local state
    });
  }*/

  render() {
    let authed;
    if(window.localStorage.getItem('auth')) {
      let userData = JSON.parse(window.localStorage.getItem('auth'));
      authed = (<li className="nav__item nav__item--text">
          Welcome back, {userData.name}
        </li>);
    }
    return (
      <div className="main">
        <header className="header">
          <h1>TeamCash</h1>

          <ul className="nav">
            {authed}
            <li className="nav__item">
              <Link to="dashboard">
                <FontAwesome name="dashboard" /> Dashboard
              </Link>
            </li>
            <li className="nav__item">
              <a href="https://github.com/elliotdavies/mondo-hackday">
                <FontAwesome name="github" /> GitHub
              </a>
            </li>
          </ul>

        </header>

        <main className="container">
          {this.props.children}
        </main>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
