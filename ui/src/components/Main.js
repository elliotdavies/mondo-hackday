require('normalize.css');
require('styles/App.css');

// Libraries
import React from 'react';
import { Link } from 'react-router';

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
    return (
      <div className="main">
        <header className="header">
          <h1>TeamCash</h1>

          <ul className="nav">
            <li>
              <Link to="dashboard">Dashboard</Link>
            </li>
            <li>
              <a href="https://github.com/elliotdavies/mondo-hackday">GitHub</a>
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
