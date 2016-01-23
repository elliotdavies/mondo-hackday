'use strict';

import React from 'react';

require('styles//Error.scss');

class ErrorComponent extends React.Component {
  render() {
    return (
      <div className="error-component">
        Please edit src/components///ErrorComponent.js to update this component!
      </div>
    );
  }
}

ErrorComponent.displayName = 'ErrorComponent';

// Uncomment properties you need
// ErrorComponent.propTypes = {};
// ErrorComponent.defaultProps = {};

export default ErrorComponent;
