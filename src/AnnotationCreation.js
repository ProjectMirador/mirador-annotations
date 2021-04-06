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
import GestureIcon from '@material-ui/icons/Gesture';
import ClosedPolygonIcon from '@material-ui/icons/ChangeHistory';
import OpenPolygonIcon from '@material-ui/icons/ShowChart';
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill';
import StrokeColorIcon from '@material-ui/icons/BorderColor';
import LineWeightIcon from '@material-ui/icons/LineWeight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import FormatShapesIcon from '@material-ui/icons/FormatShapes';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import Popover from '@material-ui/core/Popover';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { SketchPicker } from 'react-color';
import { v4 as uuid } from 'uuid';
import { withStyles } from '@material-ui/core/styles';
import CompanionWindow from 'mirador/dist/es/src/containers/CompanionWindow';
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
    annoState.image = false;

    if (props.annotation) {
      if (Array.isArray(props.annotation.body)) {
        annoState.tags = [];
        props.annotation.body.forEach((body) => {
          if (body.purpose === 'tagging' && body.type === 'TextualBody') {
            annoState.tags.push(body.value);
          } else if (body.type === 'TextualBody') {
            annoState.textBody = body.value;
          } else if (body.type === 'imgBody') {
            annoState.textBody = body.value;
            annoState.image = body.image;
          }
        });
      } else if (props.annotation.body.type === 'TextualBody') {
        annoState.textBody = props.annotation.body.value;
      } else if (props.annotation.body.type === 'imgBody') {
        annoState.textBody = props.annotation.body.value;
        annoState.image = props.annotation.body.image;
      }

      if (Array.isArray(props.annotation.target.selector)) {
        props.annotation.target.selector.forEach((selector) => {
          if (selector.type === 'SvgSelector') {
            annoState.svg = selector.value;
          } else if (selector.type === 'FragmentSelector') {
            annoState.xywh = selector.value.replace('xywh=', '');
          }
        });
      } else {
        annoState.svg = props.annotation.target.selector.value;
      }
    }

    this.state = {
      activeTool: 'cursor',
      closedMode: 'closed',
      colorPopoverOpen: false,
      currentColorType: false,
      fillColor: null,
      imgConstrain: false,
      lineWeightPopoverOpen: false,
      popoverAnchorEl: null,
      popoverLineWeightAnchorEl: null,
      strokeColor: '#00BFFF',
      strokeWidth: 1,
      svg: null,
      textBody: '',
      xywh: null,
      imgHeight: {
        lastSubmittedValue: '',
        srcValue: '',
        validity: 0,
        value: '',
      },
      imgWidth: {
        lastSubmittedValue: '',
        srcValue: '',
        validity: 0,
        value: '',
      },
      imgUrl: {
        lastSubmittedValue: '',
        validity: 0,
        value: '',
      },
      openAddImgDialog: false,
      ...annoState,
    };

    this.submitForm = this.submitForm.bind(this);
    this.updateTextBody = this.updateTextBody.bind(this);
    this.getImgDimensions = this.getImgDimensions.bind(this);
    this.loadImg = this.loadImg.bind(this);
    this.setImgWidth = this.setImgWidth.bind(this);
    this.setImgHeight = this.setImgHeight.bind(this);
    this.updateGeometry = this.updateGeometry.bind(this);
    this.changeTool = this.changeTool.bind(this);
    this.changeClosedMode = this.changeClosedMode.bind(this);
    this.openChooseColor = this.openChooseColor.bind(this);
    this.openChooseLineWeight = this.openChooseLineWeight.bind(this);
    this.handleLineWeightSelect = this.handleLineWeightSelect.bind(this);
    this.handleCloseLineWeight = this.handleCloseLineWeight.bind(this);
    this.closeChooseColor = this.closeChooseColor.bind(this);
    this.updateStrokeColor = this.updateStrokeColor.bind(this);
    this.isConstrained = this.isConstrained.bind(this);
    this.handleConstrainCheck = this.handleConstrainCheck.bind(this);
    this.handleImgDialogChange = this.handleImgDialogChange.bind(this);
    this.handleImgDialogSubmit = this.handleImgDialogSubmit.bind(this);
  }

  /** */
  handleImgDialogChange(open) {
    const { imgHeight, imgWidth, imgUrl } = this.state;

    this.setState({
      openAddImgDialog: open,
      imgUrl: {
        ...imgUrl,
        validity: 1,
        value: imgUrl.lastSubmittedValue,
      },
      imgHeight: {
        ...imgHeight,
        validity: 1,
        value: imgHeight.lastSubmittedValue,
      },
      imgWidth: {
        ...imgWidth,
        validity: 1,
        value: imgWidth.lastSubmittedValue,
      }
    });
  };

  //adjust the other dimension in proportion to the inputted dimension if constrained checkbox is checked
  isConstrained(event) {
    const { imgConstrain, imgWidth, imgHeight } = this.state;
    const ratio = imgWidth.srcValue/imgHeight.srcValue;

    if(imgConstrain){
      if(event.target.id == 'width' && imgWidth.srcValue !== ''){        
        //set height to be the same as width if width is less than 0
        const height = imgWidth.value > 0 ? imgWidth.value * (1/ratio) : imgWidth.value;
        this.setState({
          imgHeight: {
            ...imgHeight,
            validity: 1,
            value: height,
          },
        });
      } else if(event.target.id == 'height' && imgHeight.srcValue !== ''){

        //set width to be the same as height if height is less than 0
        const width = imgHeight.value > 0 ? imgHeight.value * ratio : imgHeight.value;

        this.setState({
          imgWidth: {
            ...imgWidth,
            validity: 1,
            value: width,
          },
        });
      }
    }
  }

  handleConstrainCheck(event) {
    const value = event.target.checked;

    this.setState({
      imgConstrain: value,
    });
  }

  handleImgDialogSubmit() {
    let open = true;
    const { imgUrl, imgHeight, imgWidth } = this.state;

    const expression = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
    const regex = new RegExp(expression);
    const urlValidity = imgUrl.value.match(regex) ? 1 : 2;
    const widthValidity = imgWidth.value > 0 ? 1 : 2;
    const heightValidity = imgHeight.value > 0 ? 1 : 2;
    if (urlValidity === 1 && widthValidity === 1 && heightValidity === 1) {
      open = false;
    }
    
    this.setState({
      imgUrl: {
        ...imgUrl,
        value: imgUrl.value,
        validity: urlValidity,
        lastSubmittedValue: urlValidity === 1 ? imgUrl.value : imgUrl.lastSubmittedValue,
      },
      imgHeight: {
        ...imgHeight,
        value: imgHeight.value,
        validity: heightValidity,
        lastSubmittedValue: heightValidity === 1 ? imgHeight.value : imgHeight.lastSubmittedValue,
      },
      imgWidth: {
        ...imgWidth,
        value: imgWidth.value,
        validity: widthValidity,
        lastSubmittedValue: widthValidity === 1 ? imgWidth.value : imgWidth.lastSubmittedValue,
      },
      openAddImgDialog: open,
    });
  }

  setImgHeight(value) {
    const { imgHeight } = this.state
    this.setState({
      imgHeight: {
        ...imgHeight,
        value,
      },
    });
  }

  setImgUrl(value) {
    const { imgUrl } = this.state
    this.setState({
      imgUrl: {
        ...imgUrl,
        value,
      },
    });
  }

  setImgWidth(value) {
    const { imgWidth } = this.state
    this.setState({
      imgWidth: {
        ...imgWidth,
        value,
      },
    });
  }

  loadImg(url){
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;

      img.onload = () => resolve({height: img.height, width: img.width});
      img.onerror = reject;
    })
  }

  async getImgDimensions(url) {
    const { imgHeight, imgWidth, imgUrl } = this.state;
    try {
      const dimensions = await this.loadImg(url);

      this.setState({
        imgUrl: {
          ...imgUrl,
          validity: 1,
          value: url,
        },
        imgHeight: {
          ...imgHeight,
          srcValue: dimensions.height || '',
          value: dimensions.height || '',
        },
        imgWidth: {
          ...imgWidth,
          srcValue: dimensions.width || '',
          value: dimensions.width || '',
        },
      });
    } catch (e) {
      this.setState({
        imgUrl: {
          ...imgUrl,
          validity: 2,
          value : url,
        },
      });
    }
  }

  handleCloseLineWeight(e) {
    this.setState({
      lineWeightPopoverOpen: false,
      popoverLineWeightAnchorEl: null,
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
      annotation, canvases, closeCompanionWindow, receiveAnnotation, config, imgConstrain
    } = this.props;
    const {
      textBody, image, imgWidth, imgHeight, imgUrl, tags, xywh, svg,
    } = this.state;
    let annoBody = {value: textBody}
    let imgBody;

    if(imgWidth.validity == 1 && imgHeight.validity == 1 && imgUrl.validity == 1){
      imgBody = {
        w: imgWidth.value,
        h: imgHeight.value,
        url: imgUrl.value,
        constrain: imgConstrain,
      }
    } else {
      imgBody = image;
    }

    canvases.forEach((canvas) => {
      const storageAdapter = config.annotation.adapter(canvas.id);

      const anno = new WebAnnotation({
        body: {...annoBody},
        canvasId: canvas.id,
        id: (annotation && annotation.id) || `${uuid()}`,
        manifestId: canvas.options.resource.id,
        svg,
        tags,
        image: imgBody,
        xywh,
      }).toJson();

      if (annotation) {
        storageAdapter.update(anno).then((annoPage) => {
          receiveAnnotation(canvas.id, storageAdapter.annotationPageId, annoPage);
        });
      } else {
        storageAdapter.create(anno).then((annoPage) => {
          receiveAnnotation(canvas.id, storageAdapter.annotationPageId, annoPage);
        });
      }
    });
    this.setState({
      activeTool: null,
    });
    closeCompanionWindow();
  }

  /** */
  changeTool(e, tool) {
    this.setState({
      activeTool: tool,
    });
  }

  /** */
  changeClosedMode(e) {
    this.setState({
      closedMode: e.currentTarget.value,
    });
  }

  /** */
  updateTextBody(textBody) {
    this.setState({ textBody });
  }

  /** */
  updateGeometry({ svg, xywh }) {
    this.setState({
      svg, xywh,
    });
  }

  /** */
  render() {
    const {
      annotation, classes, closeCompanionWindow, id, windowId,
    } = this.props;

    const {
      activeTool, colorPopoverOpen, currentColorType, fillColor, openAddImgDialog, popoverAnchorEl, strokeColor,
      popoverLineWeightAnchorEl, lineWeightPopoverOpen, strokeWidth, closedMode, textBody, image, imgUrl, imgWidth, imgHeight, imgConstrain, svg,
    } = this.state;
    return (
      <CompanionWindow
        title={annotation ? 'Edit annotation' : 'New annotation'}
        windowId={windowId}
        id={id}
      >
        <AnnotationDrawing
          activeTool={activeTool}
          annotation={annotation}
          fillColor={fillColor}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          closed={closedMode === 'closed'}
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
                  <ToggleButton value="edit" aria-label="select cursor">
                    <FormatShapesIcon />
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
                  <ToggleButton value="ellipse" aria-label="add a circle">
                    <CircleIcon />
                  </ToggleButton>
                  <ToggleButton value="polygon" aria-label="add a polygon">
                    <PolygonIcon />
                  </ToggleButton>
                  <ToggleButton value="freehand" aria-label="free hand polygon">
                    <GestureIcon />
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

              <Divider flexItem orientation="vertical" className={classes.divider} />
              { /* close / open polygon mode only for freehand drawing mode. */
                activeTool === 'freehand'
                  ? (
                    <ToggleButtonGroup
                      size="small"
                      value={closedMode}
                      onChange={this.changeClosedMode}
                    >
                      <ToggleButton value="closed">
                        <ClosedPolygonIcon />
                      </ToggleButton>
                      <ToggleButton value="open">
                        <OpenPolygonIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  )
                  : null
              }
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">
                Image Content
              </Typography>
            </Grid>
            <Grid item xs={12} style={{marginBottom: 10}}>
              <ToggleButton value="image-icon" aria-label="insert an image" onClick={() => this.handleImgDialogChange(true)}>
                <InsertPhotoIcon />
              </ToggleButton>
            </Grid>
            <Dialog open={openAddImgDialog} fullWidth minWidth="20%" onClose={() => this.handleImgDialogChange(false)} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">
                <Typography variant="h2">Insert image</Typography>
              </DialogTitle>
              <DialogContent>
                <DialogTitle id="form-dialog-subtitle-1" style={{paddingLeft: 0}}>
                  <Typography variant="MuiTypography-h3">Image source</Typography>
                </DialogTitle>
                <TextField
                  value={imgUrl.value}
                  onChange={e => this.setImgUrl(e.target.value)}
                  onBlur={e => this.getImgDimensions(e.target.value)}
                  error={imgUrl.validity == 2}
                  helperText={imgUrl.validity === 2 ? "Invalid URL" : ""}
                  margin="dense"
                  id="source"
                  label="Image URL"
                  type="url"
                  fullWidth
                />
              </DialogContent>
              <DialogContent>
                <DialogTitle id="form-dialog-subtitle-2" style={{paddingLeft: 0}}>
                  <Typography variant="MuiTypography-h3">Image dimensions</Typography>
                </DialogTitle>
                <TextField
                  value={imgWidth.value}
                  style = {{width: 100, marginRight: 10}}
                  onChange={e => this.setImgWidth(e.target.value)}
                  onBlur={(e) => this.isConstrained(e)}
                  error={imgWidth.validity == 2}
                  helperText={imgWidth.validity === 2 ? "Invalid width" : ""}
                  margin="dense"
                  id="width"
                  label="Width"
                  type="number"
                  variant="outlined"
                />
                <TextField
                  value={imgHeight.value}
                  style = {{width: 100, marginLeft: 10 }}
                  onChange={e => this.setImgHeight(e.target.value)}
                  onBlur={(e) => this.isConstrained(e)}
                  error={imgHeight.validity === 2}
                  helperText={imgHeight.validity === 2 ? "Invalid height" : ""}
                  margin="dense"
                  id="height"
                  label="Height"
                  type="number"
                  variant="outlined" 
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={imgConstrain}
                      onChange={(e) => this.handleConstrainCheck(e)}
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                      style = {{ marginLeft: 30 }}
                    />
                  }
                  label="Constrain proportions"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.handleImgDialogChange(false)}>Cancel</Button>
                <Button variant="contained" onClick={this.handleImgDialogSubmit} color="primary">Add</Button>
              </DialogActions>
            </Dialog>
            <Grid item xs={12}>
              <Typography variant="overline">
                Text Content
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextEditor
                annoHtml={textBody}
                updateAnnotationBody={this.updateTextBody}
              />
            </Grid>
          </Grid>
          <Button onClick={closeCompanionWindow}>
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
      </CompanionWindow>
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
});

AnnotationCreation.propTypes = {
  annotation: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number }),
  ),
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  closeCompanionWindow: PropTypes.func,
  config: PropTypes.shape({
    annotation: PropTypes.shape({
      adapter: PropTypes.func,
    }),
  }).isRequired,
  id: PropTypes.string.isRequired,
  receiveAnnotation: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};

AnnotationCreation.defaultProps = {
  annotation: null,
  canvases: [],
  closeCompanionWindow: () => {},
};

export default withStyles(styles)(AnnotationCreation);
