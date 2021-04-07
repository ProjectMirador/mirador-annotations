import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';

/**
 * Dialog to enforce single view for annotation creation / editing
 */
class SingleCanvasDialog extends Component {
  /** */
  constructor(props) {
    super(props);
    this.confirm = this.confirm.bind(this);
  }

  /** */
  confirm() {
    const {
      handleClose,
      switchToSingleCanvasView,
    } = this.props;
    switchToSingleCanvasView();
    handleClose();
  }

  /** */
  render() {
    const {
      handleClose,
      open,
    } = this.props;
    return (
      <Dialog
        aria-labelledby="single-canvas-dialog-title"
        fullWidth
        maxWidth="sm"
        onClose={handleClose}
        onEscapeKeyDown={handleClose}
        open={open}
      >
        <DialogTitle id="single-canvas-dialog-title" disableTypography>
          <Typography variant="h2">
            Switch view type to single view?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant="body1" color="inherit">
            Annotations can only be edited in single canvas view type.
            Switch view type to single view now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button color="primary" onClick={this.confirm} variant="contained">
            Switch to single view
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

SingleCanvasDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  switchToSingleCanvasView: PropTypes.func.isRequired,
};

SingleCanvasDialog.defaultProps = {
  open: false,
};

export default SingleCanvasDialog;
