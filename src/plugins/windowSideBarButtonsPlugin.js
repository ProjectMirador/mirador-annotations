import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * A wrapper plugin that sets hasAnyAnnotations to true so that the annotation
 * companion window button is present
 */
class WindowSideBarButtonWrapper extends Component {
  /** */
  render() {
    const { PluginComponents, TargetComponent, targetProps } = this.props;
    targetProps.hasAnyAnnotations = true;
    return (
      <TargetComponent
        {...targetProps} // eslint-disable-line react/jsx-props-no-spreading
        PluginComponents={PluginComponents}
      />
    );
  }
}

WindowSideBarButtonWrapper.propTypes = {
  PluginComponents: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  TargetComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]).isRequired,
  targetProps: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

WindowSideBarButtonWrapper.defaultProps = {
  PluginComponents: [],
};

export default {
  component: WindowSideBarButtonWrapper,
  mode: 'wrap',
  target: 'WindowSideBarButtons',
};
