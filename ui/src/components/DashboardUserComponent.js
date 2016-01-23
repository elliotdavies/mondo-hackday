'use strict';

import React from 'react';
import { Link } from 'react-router';

import LazyImage from './LazyImageComponent';

require('styles//DashboardUser.scss');

class DashboardUserComponent extends React.Component {
  render() {
    return (
      <li className="dashboard__user">
        <LazyImage src={this.props.user.avatar} />
        <div className="user__meta">
          <h2>{this.props.user.name}</h2>
          <p>{this.props.user.email}</p>
          {(this.props.user.spending > this.props.averageSpend) ? (<span className="label label--negative">Above average this week</span>) : (<span className="label label--positive">Below average this week</span>)}
        </div>
        <Link to={'user/' + this.props.user.id} className="button">Weekly spend of £{this.props.user.spending}</Link>
      </li>
    );
  }
}

DashboardUserComponent.displayName = 'DashboardUserComponent';

// Uncomment properties you need
// DashboardUserComponent.propTypes = {};
// DashboardUserComponent.defaultProps = {};

export default DashboardUserComponent;
