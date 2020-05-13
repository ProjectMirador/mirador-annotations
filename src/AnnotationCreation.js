import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import RectangleIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CircleIcon from '@material-ui/icons/RadioButtonUnchecked';
import PolygonIcon from '@material-ui/icons/Timeline';
import TextField from '@material-ui/core/TextField';
import { v4 as uuid } from 'uuid';
import AnnotationDrawing from './AnnotationDrawing';
import WebAnnotation from './WebAnnotation';
/** */
class AnnotationCreation extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = {
      activeTool: null, annoBody: '', svg: null, xywh: null,
    };

    this.submitForm = this.submitForm.bind(this);
    this.updateBody = this.updateBody.bind(this);
    this.updateGeometry = this.updateGeometry.bind(this);
    this.changeTool = this.changeTool.bind(this);
  }

  /** */
  submitForm(e) {
    e.preventDefault();
    const {
      canvases, parentactions, receiveAnnotation, config,
    } = this.props;
    const { annoBody, xywh, svg } = this.state;
    canvases.forEach((canvas) => {
      const localStorageAdapter = config.annotation.adapter(canvas.id);
      const anno = new WebAnnotation({
        body: annoBody,
        canvasId: canvas.id,
        id: `https://example.org/iiif/book1/page/manifest/${uuid()}`,
        svg,
        xywh,
      }).toJson();
      const newAnnoPage = localStorageAdapter.create(anno);
      receiveAnnotation(canvas.id, localStorageAdapter.annotationPageId, newAnnoPage);
    });
    this.setState({
      activeTool: null,
    });
    parentactions.closeCompanionWindow();
  }

  /** */
  changeTool(e, tool) {
    this.setState({
      activeTool: tool,
    });
  }

  /** */
  updateBody(e) {
    this.setState({ annoBody: e.target.value });
  }

  /** */
  updateGeometry({ svg, xywh }) {
    this.setState({
      svg, xywh,
    });
  }

  /** */
  render() {
    const { parentactions, windowId } = this.props;
    const { activeTool, annoBody } = this.state;
    return (
      <div>
        { activeTool && (
          <AnnotationDrawing
            activeTool={activeTool}
            updateGeometry={this.updateGeometry}
            windowId={windowId}
          />
        )}
        <form onSubmit={this.submitForm}>
          <ToggleButtonGroup
            value={activeTool}
            exclusive
            onChange={this.changeTool}
            aria-label="tool selection"
            size="small"
          >
            <ToggleButton value="rectangle" aria-label="add a rectangle">
              <RectangleIcon />
            </ToggleButton>
            <ToggleButton value="circle" aria-label="add a circle">
              <CircleIcon />
            </ToggleButton>
            <ToggleButton value="polygon" aria-label="add a polygon">
              <PolygonIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <TextField
            multiline
            rows={6}
            value={annoBody}
            onChange={this.updateBody}
          />
          <Button onClick={parentactions.closeCompanionWindow}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
        </form>
      </div>
    );
  }
}

AnnotationCreation.propTypes = {
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number }),
  ),
  config: PropTypes.shape({
    annotation: PropTypes.shape({
      adapter: PropTypes.func,
    }),
  }).isRequired,
  parentactions: PropTypes.shape({
    closeCompanionWindow: PropTypes.func,
  }),
  receiveAnnotation: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};

AnnotationCreation.defaultProps = {
  canvases: [],
  parentactions: {},
};


export default AnnotationCreation;
