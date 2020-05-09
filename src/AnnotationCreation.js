import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import AddBoxIcon from '@material-ui/icons/AddBox';
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
    this.addBox = this.addBox.bind(this);
  }

  /** */
  submitForm(e) {
    e.preventDefault();
    const { canvases, receiveAnnotation, config } = this.props;
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
  }

  /** */
  addBox() {
    this.setState({
      activeTool: 'rectangle',
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
    const { windowId } = this.props;
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
          <MiradorMenuButton
            aria-label="Add Box"
            onClick={this.addBox}
          >
            <AddBoxIcon />
          </MiradorMenuButton>
          <TextField
            multiline
            rows={6}
            value={annoBody}
            onChange={this.updateBody}
          />
          <Button>
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
  receiveAnnotation: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};

AnnotationCreation.defaultProps = {
  canvases: [],
};


export default AnnotationCreation;
