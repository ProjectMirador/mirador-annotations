import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { OSDReferences } from 'mirador/dist/es/src/plugins/OSDReferences';
import { renderWithPaperScope, PaperContainer } from '@psychobolt/react-paperjs';
import
{
  EllipseTool,
  PolygonTool,
  RectangleTool,
  FreeformPathTool,
}
  from '@psychobolt/react-paperjs-editor';
import { Point } from 'paper';
import flatten from 'lodash/flatten';
import EditTool from './EditTool';
import { mapChildren } from './utils';

/** */
class AnnotationDrawing extends Component {
  /** */
  constructor(props) {
    super(props);

    this.addPath = this.addPath.bind(this);
  }

  /** */
  componentDidMount() {
    const { windowId } = this.props;
    this.OSDReference = OSDReferences.get(windowId);
  }

  /** */
  addPath(path) {
    const { closed, strokeWidth, updateGeometry } = this.props;
    // TODO: Compute xywh of bounding container of layers
    const { bounds } = path;
    const {
      x, y, width, height,
    } = bounds;
    path.closed = closed; // eslint-disable-line no-param-reassign
    // Reset strokeWidth for persistence
    path.strokeWidth = strokeWidth; // eslint-disable-line no-param-reassign
    path.data.state = null; // eslint-disable-line no-param-reassign
    const svgExports = flatten(path.project.layers.map((layer) => (
      flatten(mapChildren(layer)).map((aPath) => aPath.exportSVG({ asString: true }))
    )));
    svgExports.unshift("<svg xmlns='http://www.w3.org/2000/svg'>");
    svgExports.push('</svg>');
    updateGeometry({
      svg: svgExports.join(''),
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
    const {
      activeTool, fillColor, strokeColor, strokeWidth, svg,
    } = this.props;
    if (!activeTool || activeTool === 'cursor') return null;
    // Setup Paper View to have the same center and zoom as the OSD Viewport
    const viewportZoom = this.OSDReference.viewport.getZoom(true);
    const image1 = this.OSDReference.world.getItemAt(0);
    const center = image1.viewportToImageCoordinates(
      this.OSDReference.viewport.getCenter(true),
    );
    const flipped = this.OSDReference.viewport.getFlip();

    const viewProps = {
      center: new Point(center.x, center.y),
      rotation: this.OSDReference.viewport.getRotation(),
      scaling: new Point(flipped ? -1 : 1, 1),
      zoom: image1.viewportToImageZoom(viewportZoom),
    };

    let ActiveTool = RectangleTool;
    switch (activeTool) {
      case 'rectangle':
        ActiveTool = RectangleTool;
        break;
      case 'ellipse':
        ActiveTool = EllipseTool;
        break;
      case 'polygon':
        ActiveTool = PolygonTool;
        break;
      case 'freehand':
        ActiveTool = FreeformPathTool;
        break;
      case 'edit':
        ActiveTool = EditTool;
        break;
      default:
        break;
    }

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
          {renderWithPaperScope((paper) => {
            const paths = flatten(paper.project.layers.map((layer) => (
              flatten(mapChildren(layer)).map((aPath) => aPath)
            )));
            if (svg && paths.length === 0) {
              paper.project.importSVG(svg);
            }
            paper.settings.handleSize = 10; // eslint-disable-line no-param-reassign
            paper.settings.hitTolerance = 10; // eslint-disable-line no-param-reassign
            return (
              <ActiveTool
                onPathAdd={this.addPath}
                pathProps={{
                  fillColor,
                  strokeColor,
                  strokeWidth: strokeWidth / paper.view.zoom,
                }}
                paper={paper}
              />
            );
          })}
        </PaperContainer>
      </div>
    );
  }

  /** */
  render() {
    const { windowId } = this.props;
    this.OSDReference = OSDReferences.get(windowId).current;
    return (
      ReactDOM.createPortal(this.paperThing(), this.OSDReference.element)
    );
  }
}

AnnotationDrawing.propTypes = {
  activeTool: PropTypes.string,
  closed: PropTypes.bool,
  fillColor: PropTypes.string,
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  svg: PropTypes.string,
  updateGeometry: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};

AnnotationDrawing.defaultProps = {
  activeTool: null,
  closed: true,
  fillColor: null,
  strokeColor: '#00BFFF',
  strokeWidth: 1,
  svg: null,
};

export default AnnotationDrawing;
