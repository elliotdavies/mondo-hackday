import 'core-js/fn/object/assign';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route } from 'react-router';

// Components
import App from './components/Main';
import User from './components/UserComponent';
import Auth from './components/AuthComponent';
import Login from './components/LoginComponent';
import Dashboard from './components/DashboardComponent';
import Print from './components/PrintComponent';
import UserMessage from './components/UserMessageComponent';
import NoMatch from './components/ErrorComponent';

// Declarative route configuration (could also load this config lazily
// instead, all you really need is a single root route, you don't need to
// colocate the entire config).
render((
  <Router onUpdate={() => window.scrollTo(0, 0)}>
    <Route name="print" path="user/:id/print" component={Print}/>

    <Route path="/" component={App}>
      <Route path="auth/:user" component={Auth}/>
      <Route path="login" component={Login}/>
      <Route path="dashboard" component={Dashboard}/>
      <Route name="user" path="user/:id" component={User}/>
      <Route name="message" path="user/:id/:account/message" component={UserMessage}/>
      <Route path="*" component={NoMatch}/>
    </Route>
  </Router>
), document.getElementById('app'));
