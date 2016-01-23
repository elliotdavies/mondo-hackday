'use strict';

import React from 'react';

import DashboardUserComponent from './DashboardUserComponent';
import RequireAuthComponent from './RequireAuthComponent';
import DashboardTransactionComponent from './DashboardTransactionComponent';

const config = require('json!../../config.json');

var Chart = require('react-chartjs');
var BarChart = Chart.Bar;

require('styles//Dashboard.scss');

// Libraries
var Rebase = require('re-base');

// Configure Firebase
var base = Rebase.createClass(config.database);

class DashboardComponent extends RequireAuthComponent {

  constructor(props) {
    super(props);

    this.state = {
      recentTransactions: [],
      averageSpend: 652.23,
      users: []
    }
  }

  componentDidMount() {
    this.recentBind = base.bindToState('recent/team', {
      context: this,
      state: 'recentTransactions',
      asArray: true,
      queries: {
        orderByChild: 'created',
        limitToLast: 3
      }
    });

    this.usersBind = base.bindToState('users', {
      context: this,
      state: 'users',
      asArray: true
    });
  }

  componentWillUnmount() {
    base.removeBinding(this.recentBind);
    base.removeBinding(this.usersBind);
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
              {this.state.recentTransactions.map(function(transaction, key) {
                return (<DashboardTransactionComponent transaction={transaction} key={key} />);
              }.bind(this))}
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
