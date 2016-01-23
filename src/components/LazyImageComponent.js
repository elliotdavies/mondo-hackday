'use strict';

import React from 'react';

require('styles//LazyImage.scss');

class LazyImageComponent extends React.Component {

  render() {
    return (
      <img className="lazyimage-component" ref="image" src={this.props.src} />
    );
  }
}

LazyImageComponent.displayName = 'LazyImageComponent';

// Uncomment properties you need
// LazyImageComponent.propTypes = {};
// LazyImageComponent.defaultProps = {};

export default LazyImageComponent;
