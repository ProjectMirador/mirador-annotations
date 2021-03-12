import React, { Component } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import GetAppIcon from '@material-ui/icons/GetApp';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import PropTypes, { bool } from 'prop-types';

/** */
class AnnotationDownloadDialog extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = {
      downloadLinks: [],
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
          const label = canvas.__jsonld.label || canvas.id;
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
        canvases.reduce(reducer, []).then((downloadLinks) => {
          this.setState({ downloadLinks });
        });
      }
    }
  }

  /** */
  closeDialog() {
    const { handleClose } = this.props;
    this.setState({ downloadLinks: [] });
    handleClose();
  }

  /** */
  render() {
    const { handleClose, open } = this.props;
    const { downloadLinks } = this.state;
    return (
      <Dialog
        aria-labelledby="annotation-download-dialog-title"
        id="annotation-download-dialog"
        onClose={handleClose}
        onEscapeKeyDown={this.closeDialog}
        open={open}
      >
        <DialogTitle id="annotation-download-dialog-title" disableTypography>
          <Typography variant="h2">Download Annotations</Typography>
        </DialogTitle>
        <DialogContent>
          { downloadLinks === undefined || downloadLinks.length === 0 ? (
            <Typography variant="body1">No annotations stored yet.</Typography>
          ) : (
            <List>
              { downloadLinks.map((dl) => (
                <ListItem
                  button
                  component="a"
                  key={dl.canvasId}
                  aria-label={`Download annotations for ${dl.label}`}
                  href={dl.url}
                  download={`${dl.id}.json`}
                >
                  <ListItemIcon>
                    <GetAppIcon />
                  </ListItemIcon>
                  <ListItemText>
                    {`Download annotations for "${dl.label}"`}
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}

AnnotationDownloadDialog.propTypes = {
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number }),
  ).isRequired,
  config: PropTypes.shape({
    annotation: PropTypes.shape({
      adapter: PropTypes.func,
    }),
  }).isRequired,
  handleClose: PropTypes.func.isRequired,
  open: bool.isRequired,
};

export default AnnotationDownloadDialog;
