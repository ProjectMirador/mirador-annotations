import React, { Component } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import GetAppIcon from '@material-ui/icons/GetApp';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import PropTypes, { bool } from 'prop-types';
import { withStyles } from '@material-ui/core';

/** */
const styles = (theme) => ({
  listitem: {
    '&:focus': {
      backgroundColor: theme.palette.action.focus,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
});

/** */
class AnnotationExportDialog extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = {
      exportLinks: [],
    };
    this.closeDialog = this.closeDialog.bind(this);
  }

  /** */
  componentDidUpdate(prevProps) {
    const { canvases, config, open } = this.props;
    const { open: prevOpen } = prevProps || {};
    if (prevOpen !== open && open) {
      /** */
      const reducer = async (acc, canvas) => {
        const store = config.annotation.adapter(canvas.id);
        const resolvedAcc = await acc;
        const content = await store.all();
        if (content) {
          // eslint-disable-next-line no-underscore-dangle
          const label = (canvas.__jsonld && canvas.__jsonld.label) || canvas.id;
          const data = new Blob([JSON.stringify(content)], { type: 'application/json' });
          const url = window.URL.createObjectURL(data);
          return [...resolvedAcc, {
            canvasId: canvas.id,
            id: content.id || content['@id'],
            label,
            url,
          }];
        }
        return resolvedAcc;
      };
      if (canvases && canvases.length > 0) {
        canvases.reduce(reducer, []).then((exportLinks) => {
          this.setState({ exportLinks });
        });
      }
    }
  }

  /** */
  closeDialog() {
    const { handleClose } = this.props;
    this.setState({ exportLinks: [] });
    handleClose();
  }

  /** */
  render() {
    const { classes, handleClose, open } = this.props;
    const { exportLinks } = this.state;
    return (
      <Dialog
        aria-labelledby="annotation-export-dialog-title"
        id="annotation-export-dialog"
        onClose={handleClose}
        onEscapeKeyDown={this.closeDialog}
        open={open}
      >
        <DialogTitle id="annotation-export-dialog-title" disableTypography>
          <Typography variant="h2">Export Annotations</Typography>
        </DialogTitle>
        <DialogContent>
          { exportLinks === undefined || exportLinks.length === 0 ? (
            <Typography variant="body1">No annotations stored yet.</Typography>
          ) : (
            <MenuList>
              { exportLinks.map((dl) => (
                <MenuItem
                  button
                  className={classes.listitem}
                  component="a"
                  key={dl.canvasId}
                  aria-label={`Export annotations for ${dl.label}`}
                  href={dl.url}
                  download={`${dl.id}.json`}
                >
                  <ListItemIcon>
                    <GetAppIcon />
                  </ListItemIcon>
                  <ListItemText>
                    {`Export annotations for "${dl.label}"`}
                  </ListItemText>
                </MenuItem>
              ))}
            </MenuList>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}

AnnotationExportDialog.propTypes = {
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string }),
  ).isRequired,
  classes: PropTypes.objectOf(PropTypes.string),
  config: PropTypes.shape({
    annotation: PropTypes.shape({
      adapter: PropTypes.func,
    }),
  }).isRequired,
  handleClose: PropTypes.func.isRequired,
  open: bool.isRequired,
};

AnnotationExportDialog.defaultProps = {
  classes: {},
};

export default withStyles(styles)(AnnotationExportDialog);
