'use strict';

import React from 'react';

require('styles//User.scss');

class UserComponent extends React.Component {
  componentDidMount() {
    console.log(this.props.params);
  }

  render() {
    return (
      <div className="user-component">
        Please edit src/components///UserComponent.js to update this component!
      </div>
    );
  }
}

UserComponent.displayName = 'UserComponent';

// Uncomment properties you need
// UserComponent.propTypes = {};
// UserComponent.defaultProps = {};

export default UserComponent;
