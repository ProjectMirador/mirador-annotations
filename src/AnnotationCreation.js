import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import RectangleIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CircleIcon from '@material-ui/icons/RadioButtonUnchecked';
import PolygonIcon from '@material-ui/icons/Timeline';
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill';
import StrokeColorIcon from '@material-ui/icons/BorderColor';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Popover from '@material-ui/core/Popover';
import { SketchPicker } from 'react-color';
import { v4 as uuid } from 'uuid';
import { withStyles } from '@material-ui/core/styles';
import AnnotationDrawing from './AnnotationDrawing';
import TextEditor from './TextEditor';
import WebAnnotation from './WebAnnotation';
/** */
class AnnotationCreation extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = {
      activeTool: null,
      annoBody: '',
      colorPopoverOpen: false,
      currentColorType: false,
      fillColor: null,
      popoverAnchorEl: null,
      strokeColor: '#00BFFF',
      svg: null,
      xywh: null,
    };

    this.submitForm = this.submitForm.bind(this);
    this.updateBody = this.updateBody.bind(this);
    this.updateGeometry = this.updateGeometry.bind(this);
    this.changeTool = this.changeTool.bind(this);
    this.openChooseColor = this.openChooseColor.bind(this);
    this.closeChooseColor = this.closeChooseColor.bind(this);
    this.updateStrokeColor = this.updateStrokeColor.bind(this);
  }

  /** */
  openChooseColor(e) {
    this.setState({
      colorPopoverOpen: true,
      currentColorType: e.currentTarget.value,
      popoverAnchorEl: e.currentTarget,
    });
  }

  /** */
  closeChooseColor(e) {
    this.setState({
      colorPopoverOpen: false,
      currentColorType: null,
      popoverAnchorEl: null,
    });
  }

  /** */
  updateStrokeColor(color) {
    const { currentColorType } = this.state;
    this.setState({
      [currentColorType]: color.hex,
    });
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
  updateBody(annoBody) {
    this.setState({ annoBody });
  }

  /** */
  updateGeometry({ svg, xywh }) {
    this.setState({
      svg, xywh,
    });
  }

  /** */
  render() {
    const { classes, parentactions, windowId } = this.props;
    const {
      activeTool, colorPopoverOpen, currentColorType, fillColor, popoverAnchorEl, strokeColor,
    } = this.state;
    return (
      <Paper className={classes.root}>
        { activeTool && (
          <AnnotationDrawing
            activeTool={activeTool}
            fillColor={fillColor}
            strokeColor={strokeColor}
            updateGeometry={this.updateGeometry}
            windowId={windowId}
          />
        )}
        <form onSubmit={this.submitForm}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">
                Target
              </Typography>
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">
                Style
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <ToggleButtonGroup
                aria-label="style selection"
                size="small"
              >
                <ToggleButton
                  value="strokeColor"
                  aria-label="select color"
                  onClick={this.openChooseColor}
                >
                  <StrokeColorIcon style={{ fill: strokeColor }} />
                  <ArrowDropDownIcon />
                </ToggleButton>
                <ToggleButton
                  value="fillColor"
                  aria-label="select color"
                  onClick={this.openChooseColor}
                >
                  <FormatColorFillIcon style={{ fill: fillColor }} />
                  <ArrowDropDownIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">
                Content
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextEditor
                updateAnnotationBody={this.updateBody}
              />
            </Grid>
          </Grid>
          <Button onClick={parentactions.closeCompanionWindow}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
        </form>
        <Popover
          open={colorPopoverOpen}
          anchorEl={popoverAnchorEl}
          onClose={this.closeChooseColor}
        >
          <SketchPicker
            // eslint-disable-next-line react/destructuring-assignment
            color={this.state[currentColorType] || {}}
            onChangeComplete={this.updateStrokeColor}
          />
        </Popover>
      </Paper>
    );
  }
}

/** */
const styles = (theme) => ({
  root: {
    padding: theme.spacing(1),
  },
});

AnnotationCreation.propTypes = {
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number }),
  ),
  classes: PropTypes.shape({
    root: PropTypes.string,
  }).isRequired,
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


export default withStyles(styles)(AnnotationCreation);
