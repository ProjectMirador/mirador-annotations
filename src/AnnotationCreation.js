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
import LineWeightIcon from '@material-ui/icons/LineWeight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Popover from '@material-ui/core/Popover';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuList from '@material-ui/core/MenuList';
import { SketchPicker } from 'react-color';
import { v4 as uuid } from 'uuid';
import { withStyles } from '@material-ui/core/styles';
import AnnotationDrawing from './AnnotationDrawing';
import TextEditor from './TextEditor';
import WebAnnotation from './WebAnnotation';
import CursorIcon from './icons/Cursor';

/** */
class AnnotationCreation extends Component {
  /** */
  constructor(props) {
    super(props);
    const annoState = {};
    if (props.annotation) {
      annoState.annoBody = props.annotation.body.value;
      annoState.svg = props.annotation.target.selector.value;
    }
    this.state = {
      activeTool: 'cursor',
      annoBody: '',
      colorPopoverOpen: false,
      currentColorType: false,
      fillColor: null,
      lineWeightPopoverOpen: false,
      popoverAnchorEl: null,
      popoverLineWeightAnchorEl: null,
      strokeColor: '#00BFFF',
      strokeWidth: 1,
      svg: null,
      xywh: null,
      ...annoState,
    };

    this.submitForm = this.submitForm.bind(this);
    this.updateBody = this.updateBody.bind(this);
    this.updateGeometry = this.updateGeometry.bind(this);
    this.changeTool = this.changeTool.bind(this);
    this.openChooseColor = this.openChooseColor.bind(this);
    this.openChooseLineWeight = this.openChooseLineWeight.bind(this);
    this.handleLineWeightSelect = this.handleLineWeightSelect.bind(this);
    this.handleCloseLineWeight = this.handleCloseLineWeight.bind(this);
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
  openChooseLineWeight(e) {
    this.setState({
      lineWeightPopoverOpen: true,
      popoverLineWeightAnchorEl: e.currentTarget,
    });
  }

  /** */
  handleLineWeightSelect(e) {
    this.setState({
      lineWeightPopoverOpen: false,
      popoverLineWeightAnchorEl: null,
      strokeWidth: e.currentTarget.value,
    });
  }

  /** */
  handleCloseLineWeight(e) {
    this.setState({
      lineWeightPopoverOpen: false,
      popoverLineWeightAnchorEl: null,
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
      annotation, canvases, parentactions, receiveAnnotation, config,
    } = this.props;
    const { annoBody, xywh, svg } = this.state;
    canvases.forEach((canvas) => {
      const localStorageAdapter = config.annotation.adapter(canvas.id);
      const anno = new WebAnnotation({
        body: annoBody,
        canvasId: canvas.id,
        id: (annotation && annotation.id) || `https://example.org/iiif/book1/page/manifest/${uuid()}`,
        svg,
        xywh,
      }).toJson();
      let newAnnoPage;
      if (annotation) {
        newAnnoPage = localStorageAdapter.update(anno);
      } else {
        newAnnoPage = localStorageAdapter.create(anno);
      }
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
      popoverLineWeightAnchorEl, lineWeightPopoverOpen, strokeWidth, annoBody, svg,
    } = this.state;
    return (
      <Paper className={classes.root}>
        <AnnotationDrawing
          activeTool={activeTool}
          fillColor={fillColor}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          svg={svg}
          updateGeometry={this.updateGeometry}
          windowId={windowId}
        />
        <form onSubmit={this.submitForm}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">
                Target
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={0} className={classes.paper}>
                <ToggleButtonGroup
                  className={classes.grouped}
                  value={activeTool}
                  exclusive
                  onChange={this.changeTool}
                  aria-label="tool selection"
                  size="small"
                >
                  <ToggleButton value="cursor" aria-label="select cursor">
                    <CursorIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
                <Divider flexItem orientation="vertical" className={classes.divider} />
                <ToggleButtonGroup
                  className={classes.grouped}
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
              </Paper>
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
                  value="strokeColor"
                  aria-label="select line weight"
                  onClick={this.openChooseLineWeight}
                >
                  <LineWeightIcon />
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
                annoHtml={annoBody}
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
          open={lineWeightPopoverOpen}
          anchorEl={popoverLineWeightAnchorEl}
        >
          <Paper>
            <ClickAwayListener onClickAway={this.handleCloseLineWeight}>
              <MenuList>
                {[1, 3, 5, 10, 50].map((option, index) => (
                  <MenuItem
                    key={option}
                    onClick={this.handleLineWeightSelect}
                    value={option}
                  >
                    {option}
                  </MenuItem>
                ))}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Popover>
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
  divider: {
    margin: theme.spacing(1, 0.5),
  },
  grouped: {
    '&:first-child': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:not(:first-child)': {
      borderRadius: theme.shape.borderRadius,
    },
    border: 'none',
    margin: theme.spacing(0.5),
  },
  paper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  root: {
    padding: theme.spacing(1),
  },
});

AnnotationCreation.propTypes = {
  annotation: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number }),
  ),
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
  annotation: null,
  canvases: [],
  parentactions: {},
};


export default withStyles(styles)(AnnotationCreation);
