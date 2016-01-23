'use strict';

import React from 'react';

import DashboardUserComponent from './DashboardUserComponent';
import RequireAuthComponent from './RequireAuthComponent';

var Chart = require('react-chartjs');
var BarChart = Chart.Bar;

require('styles//Dashboard.scss');

class DashboardComponent extends RequireAuthComponent {

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
    let chartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
            {
                label: 'Spending',
                fillColor: 'rgba(115,83,123,1)',
                strokeColor: 'rgba(115,83,123,1)',
                pointColor: 'rgba(115,83,123,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(220,220,220,1)',
                data: [65.21, 59.53, 80.34, '81.10', 56.21, 55.43, 40.12, 23.87, 54.32, 123.11, 32.90, 12.12]
            },
        ]
    };

    let chartOptions = {
      responsive: true,
      scaleOverride: true,
      scaleSteps: 6,
      scaleStepWidth: 20,
      scaleStartValue: 0,
      tooltipTemplate: "£<%= value %>",

    };

    return (
      <div className="dashboard-component">

        <h1>Spending overview</h1>

        <div className="dashboard__data">
          <div className="dashboard__card dashboard__card--chart">
            <BarChart data={chartData} options={chartOptions} />
          </div>
          <div className="dashboard__card">
            <ul className="dashboard__transactions">
              <li>
                <h4>Transaction 1 <small>by Chris Hutchinson</small></h4>
                <span class="label">£12.45</span>
              </li>
              <li>
                <h4>Transaction 2 <small>by Chris Hutchinson</small></h4>
                <span class="label">£24.45</span>
              </li>
              <li>
                <h4>Transaction 3 <small>by Chris Hutchinson</small></h4>
                <span class="label">£154.35</span>
              </li>
            </ul>
          </div>
        </div>

        <hr />

        <h1>Team members</h1>

        <ul className="dashboard__users">

          {this.state.users.map(function(user, key) {
            return (<DashboardUserComponent user={user} averageSpend={this.state.averageSpend} key={key} />);
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
