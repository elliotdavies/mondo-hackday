'use strict';

import React from 'react';
import RequireAuthComponent from './RequireAuthComponent';

import superagent from 'superagent';

const config = require('json!../../config.json');

require('styles//UserMessage.scss');

class UserMessageComponent extends RequireAuthComponent {
  constructor(props) {
    super(props);

    this.state = {
      transactions: [],
      outgoing: false,
      user: false
    }
  }

  componentDidMount() {
    this.base.fetch('users', {
      context: this,
      asArray: true,
      queries: {
        orderByChild: 'id',
        equalTo: this.props.params.id
      },
      then(data){
        this.setState({
          user: data[0]
        });
      }
    });
  }

  componentWillUnmount() {
    this.base.removeBinding(this.outgoingBind);
    this.base.removeBinding(this.userTransactionsBind);
  }

  submitData(event) {
    let data = {
      title: event.target.title.value,
      message: event.target.message.value,
      userId: this.props.params.id,
      accountId: this.props.params.account
    };

    console.log(data);

    superagent
      .post('http://' + config.server + ':' + config.port + '/message')
      .send(data)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .end(function(err, res){
        console.error(err);
        console.log(res);
      });
  }

  render() {
    if(this.state.user) {
      return (
        <div className="usermessage-component">

          <h2>Send message to {this.state.user.name}</h2>
          <p>This will show up in their Mondo feed</p>

          <form ref="form" onSubmit={this.submitData.bind(this)}>

            <label htmlFor="title">Title</label>
            <input type="text" required id="title" placeholder="Title" />

            <label htmlFor="message">Message</label>
            <input type="message" required id="message" placeholder="Message" />

            <input type="submit" value="Send" className="button" />

          </form>

        </div>
      );
    } else {
      return (<div>Loading...</div>);
    }
  }
}

UserMessageComponent.displayName = 'UserMessageComponent';

// Uncomment properties you need
// UserMessageComponent.propTypes = {};
// UserMessageComponent.defaultProps = {};

export default UserMessageComponent;
