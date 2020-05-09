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
import { Point } from 'paper';
import WebAnnotation from './WebAnnotation';
/** */
class AnnotationCreation extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = {
      activeTool: null, annoBody: '', svg: null, xywh: '0,0,1000,1000',
    };

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
  addPath(path) {
    const { bounds } = path;
    const {
      x, y, width, height,
    } = bounds;

    this.setState({
      svg: path.exportSVG({
        asString: true,
      }),
      xywh: [
        Math.floor(x),
        Math.floor(y),
        Math.floor(width),
        Math.floor(height),
      ].join(','),
    });
  }

  /** */
  paperThing() {
    const { activeTool } = this.state;
    if (!activeTool) return null;
    // Setup Paper View to have the same center and zoom as the OSD Viewport
    const viewportZoom = this.OSDReference.viewer.viewport.getZoom(true);
    const image1 = this.OSDReference.viewer.world.getItemAt(0);
    const center = this.OSDReference.viewer.viewport.viewportToImageCoordinates(
      this.OSDReference.viewer.viewport.getCenter(true),
    );
    const viewProps = {
      center: new Point(center.x, center.y),
      zoom: image1.viewportToImageZoom(viewportZoom),
    };

    return (
      <div
        className="foo"
        style={{
          height: '100%', left: 0, position: 'absolute', top: 0, width: '100%',
        }}
      >
        <PaperContainer
          canvasProps={{ style: { height: '100%', width: '100%' } }}
          viewProps={viewProps}
        >
          <RectangleTool
            onPathAdd={this.addPath}
            pathProps={{ fillColor: null, strokeColor: '#00BFFF' }}
          />
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
