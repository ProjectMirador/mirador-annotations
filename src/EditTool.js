import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tool } from '@psychobolt/react-paperjs';
import { Rectangle } from 'paper';
import flatten from 'lodash/flatten';
import { mapChildren } from './utils';
/** */
class EditTool extends Component {
  /** */
  constructor(props) {
    super(props);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseDrag = this.onMouseDrag.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  /** */
  onMouseDown(e) {
    const { paper } = this.props;
    const { project } = paper;

    const paths = flatten(project.layers.map((layer) => (
      flatten(mapChildren(layer)).map((aPath) => aPath)
    )));

    paths.forEach((path) => {
      if (path.contains(e.point)) {
        path.data.state = 'moving'; // eslint-disable-line no-param-reassign
        return;
      }
      if (path.hitTest(e.point, { segments: true, tolerance: 8 })) {
        path.data.state = 'resizing'; // eslint-disable-line no-param-reassign
        path.data.bounds = path.bounds.clone(); // eslint-disable-line no-param-reassign
        path.data.scaleBase = e.point.subtract( // eslint-disable-line no-param-reassign
          path.bounds.center,
        );
      }
    });
  }

  /** */
  onMouseDrag(e) {
    const { paper } = this.props;
    const { project } = paper;

    const paths = flatten(project.layers.map((layer) => (
      flatten(mapChildren(layer)).map((aPath) => aPath)
    )));

    paths.forEach((path) => {
      if (path.data.state === 'moving') {
        // We need to do the JavaScript version rather than the PaperScript
        // https://github.com/paperjs/paper.js/issues/1486
        path.position = path.position.add( // eslint-disable-line no-param-reassign
          e.point.subtract(e.lastPoint),
        );
      } else if (path.data.state === 'resizing') {
        const { bounds } = path.data;
        const scale = e.point.subtract(bounds.center).length / path.data.scaleBase.length;
        const tlVec = bounds.topLeft.subtract(bounds.center).multiply(scale);
        const brVec = bounds.bottomRight.subtract(bounds.center).multiply(scale);
        const newBounds = new Rectangle(tlVec.add(bounds.center), brVec.add(bounds.center));
        path.bounds = newBounds; // eslint-disable-line no-param-reassign
      }
    });
  }

  /** */
  onMouseMove(e) {
    const { paper } = this.props;
    const { project } = paper;

    const paths = flatten(project.layers.map((layer) => (
      flatten(mapChildren(layer)).map((aPath) => aPath)
    )));


    project.activeLayer.selected = false;

    paths.forEach((path) => {
      if (path.contains(e.point)) {
        path.selected = true; // eslint-disable-line no-param-reassign
      }
    });
  }

  /** */
  onMouseUp(e) {
    const { onPathAdd, paper } = this.props;
    const { project } = paper;

    const paths = flatten(project.layers.map((layer) => (
      flatten(mapChildren(layer)).map((aPath) => aPath)
    )));
    paths.forEach((path) => {
      path.data.state = null; // eslint-disable-line no-param-reassign
      onPathAdd(path);
    });
  }

  /** */
  render() {
    return (
      <Tool
        onMouseDown={this.onMouseDown}
        onMouseDrag={this.onMouseDrag}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
      />
    );
  }
}

EditTool.propTypes = {
  onPathAdd: PropTypes.func.isRequired,
  paper: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default React.forwardRef((props, ref) => <EditTool innerRef={ref} {...props} />); // eslint-disable-line
