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
  }

  logout() {
    window.localStorage.removeItem('auth');
    window.location.href = '/#/login';
  }

  render() {
    let authed;
    let logout;
    let dashboard;
    let login;

    if(window.localStorage.getItem('auth')) {
      let userData = JSON.parse(window.localStorage.getItem('auth'));
      authed = (<li className="nav__item nav__item--text">
          Welcome back, {userData.name}
        </li>);
      logout = (
        <li className="nav__item">
          <a onClick={this.logout.bind(this)}>
            <FontAwesome name="key" /> Logout
          </a>
        </li>
        );
      dashboard = (
        <li className="nav__item">
          <Link to="dashboard">
            <FontAwesome name="dashboard" /> Dashboard
          </Link>
        </li>);
    } else {
      login = (
        <li className="nav__item">
          <Link to="dashboard">
            <FontAwesome name="key" /> Login
          </Link>
        </li>);
    }

    return (
      <div className="main">
        <header className="header">
          <h1>TeamCash</h1>

          <ul className="nav">
            {authed}
            {dashboard}
            {login}
            <li className="nav__item">
              <a href="https://github.com/elliotdavies/mondo-hackday">
                <FontAwesome name="github" /> GitHub
              </a>
            </li>
            {logout}
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
