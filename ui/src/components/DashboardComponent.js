'use strict';

import React from 'react';
import { Link } from 'react-router';

require('styles//Dashboard.scss');

class DashboardComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      averageSpend: 652.23,
      users: [
        {
          id: 1,
          name: 'Chris Hutchinson',
          email: 'hello@chrishutchinson.me',
          avatar: 'https://pbs.twimg.com/profile_images/482607943071039488/vcujIxUA.jpeg',
          spending: 409.31
        },
        {
          id: 2,
          name: 'Elliot Davies',
          email: 'elliot.a.davies@gmail.com',
          avatar: 'https://pbs.twimg.com/profile_images/378800000573332482/c11b89e52dfc33206372889686a48273.jpeg',
          spending: 984.19
        }
      ]
    }
  }

  render() {
    return (
      <div className="dashboard-component">

        <ul className="dashboard__users">

          {this.state.users.map(function(user, key) {
            return (
              <li className="dashboard__user" key={key}>
                <img src={user.avatar} />
                <div className="user__meta">
                  <h2>{user.name}</h2>
                  <p>{user.email}</p>
                  {(user.spending > this.state.averageSpend) ? (<span className="label label--negative">Above average this week</span>) : (<span className="label label--positive">Below average this week</span>)}
                </div>
                <Link to={'user/' + user.id} className="button">Weekly spend of £{user.spending}</Link>
              </li>
              );
          }.bind(this))}

        </ul>
      </div>
    );
  }
}

DashboardComponent.displayName = 'DashboardComponent';

// Uncomment properties you need
// DashboardComponent.propTypes = {};
// DashboardComponent.defaultProps = {};

export default DashboardComponent;
