import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';

export class SingleCanvasDialog extends Component {
  constructor(props) {
    super(props);
    this.confirm = this.confirm.bind(this);
  }

  confirm() {
    this.props.switchToSingleCanvasView();
    this.props.openCreateAnnotationCompanionWindow();
    this.props.handleClose();
  }

  render() {
    return (
      <Dialog
        onClose={this.props.hideDialog}
        open={this.props.open}
      >
        <DialogTitle disableTypography>
          <Typography variant="h2">
            Switch view type to single view?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2" color="inherit">
            Annotations can only be edited in single canvas view type. Switch view type to single view now?
          </DialogContentText>
          <DialogActions>
            <Button onClick={this.confirm} variant="contained">
              Switch and start annotating
            </Button>
            <Button onClick={this.props.handleClose} variant="contained">
              Cancel
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    );
  }
}

SingleCanvasDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  openCreateAnnotationCompanionWindow: PropTypes.func.isRequired,
  switchToSingleCanvasView: PropTypes.func.isRequired,
}

SingleCanvasDialog.defaultProps = {
  open: false,
}
