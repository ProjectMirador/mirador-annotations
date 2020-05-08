import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { OSDReferences } from 'mirador/dist/es/src/plugins/OSDReferences';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import AddBoxIcon from '@material-ui/icons/AddBox';
import TextField from '@material-ui/core/TextField';
import { v4 as uuid } from 'uuid';
import { PaperContainer } from '@psychobolt/react-paperjs';
import { RectangleTool } from '@psychobolt/react-paperjs-editor';
import OpenSeadragon from 'openseadragon';
import WebAnnotation from './WebAnnotation';
/** */
class AnnotationCreation extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = { activeTool: null, annoBody: '', xywh: '0,0,1000,1000' };

    this.paperScope = null;
    this.OSDReference = null;

    this.submitForm = this.submitForm.bind(this);
    this.updateBody = this.updateBody.bind(this);
    this.addPath = this.addPath.bind(this);
    this.addBox = this.addBox.bind(this);
  }

  /** */
  componentDidMount() {
    const { windowId } = this.props;
    this.OSDReference = OSDReferences.get(windowId).current;
  }

  /** */
  submitForm(e) {
    e.preventDefault();
    const { canvases, receiveAnnotation, config } = this.props;
    const { annoBody, xywh } = this.state;

    canvases.forEach((canvas) => {
      const localStorageAdapter = config.annotation.adapter(canvas.id);
      const anno = new WebAnnotation({
        body: annoBody,
        canvasId: canvas.id,
        id: `https://example.org/iiif/book1/page/manifest/${uuid()}`,
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
  addPath(path) {
    console.log(path);
    const { bounds } = path;
    const {
      x, y, width, height,
    } = bounds;
    const point1 = new OpenSeadragon.Point(x, y);
    const point2 = new OpenSeadragon.Point(x + width, y + height);
    const osdBounds = this.OSDReference.viewer.viewport.getBoundsNoRotate();
    console.log(osdBounds);
    console.log(path.project.view.bounds);
    const viewportPoint1 = this.OSDReference.viewer.viewport.pointFromPixel(point1);
    const viewportPoint2 = this.OSDReference.viewer.viewport.pointFromPixel(point2);
    const viewportWidth = viewportPoint2.x - viewportPoint1.x;
    const viewportHeight = viewportPoint2.y - viewportPoint1.y;
    this.setState({
      xywh: [
        Math.floor(viewportPoint1.x),
        Math.floor(viewportPoint1.y),
        Math.floor(viewportWidth),
        Math.floor(viewportHeight),
      ].join(','),
    });
  }

  /** */
  paperThing() {
    const { activeTool } = this.state;
    if (!activeTool) return null;
    return (
      <div className="foo" style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
        <PaperContainer canvasProps={{ style: { height: '100%', width: '100%' }}}>
          <RectangleTool onPathAdd={this.addPath} pathProps={{ fillColor: null, strokeColor: 'blue' }} />
        </PaperContainer>
      </div>
    );
  }

  /** */
  render() {
    const { annoBody } = this.state;
    const { windowId } = this.props;
    this.OSDReference = OSDReferences.get(windowId).current;
    return (
      <div>
        {ReactDOM.createPortal(this.paperThing(), this.OSDReference.viewer.element)}
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
