import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Editor, EditorState, RichUtils } from 'draft-js';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import BoldIcon from '@material-ui/icons/FormatBold';
import ItalicIcon from '@material-ui/icons/FormatItalic';
import { withStyles } from '@material-ui/core/styles';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';

/** */
class TextEditor extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createWithContent(stateFromHTML(props.annoHtml)),
    };
    this.onChange = this.onChange.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.handleFormating = this.handleFormating.bind(this);
  }

  /** */
  handleFormating(e, newFormat) {
    const { editorState } = this.state;
    this.onChange(RichUtils.toggleInlineStyle(editorState, newFormat));
  }

  /** */
  handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  /** */
  onChange(editorState) {
    const { updateAnnotationBody } = this.props;
    this.setState({ editorState });
    if (updateAnnotationBody) {
      const options = {
        inlineStyles: {
          BOLD: { element: 'b' },
          ITALIC: { element: 'i' },
        },
      };
      updateAnnotationBody(stateToHTML(editorState.getCurrentContent(), options).toString());
    }
  }

  /** */
  render() {
    const { classes } = this.props;
    const { editorState } = this.state;
    const currentStyle = editorState.getCurrentInlineStyle();
    return (
      <div>
        <ToggleButtonGroup
          size="small"
          value={currentStyle.toArray()}
        >
          <ToggleButton
            onClick={this.handleFormating}
            value="BOLD"
          >
            <BoldIcon />
          </ToggleButton>
          <ToggleButton
            onClick={this.handleFormating}
            value="ITALIC"
          >
            <ItalicIcon />
          </ToggleButton>
        </ToggleButtonGroup>
        <div className={classes.editorRoot}>
          <Editor
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
          />
        </div>
      </div>
    );
  }
}

/** */
const styles = (theme) => ({
  editorRoot: {
    borderColor: theme.palette.type === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
    borderRadius: theme.shape.borderRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    fontFamily: theme.typography.fontFamily,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    minHeight: theme.typography.fontSize * 6,
    padding: theme.spacing(1),
  },
});

TextEditor.propTypes = {
  annoHtml: PropTypes.string,
  classes: PropTypes.shape({
    editorRoot: PropTypes.string,
  }).isRequired,
  updateAnnotationBody: PropTypes.func,
};

TextEditor.defaultProps = {
  annoHtml: '',
  updateAnnotationBody: () => {},
};

export default withStyles(styles)(TextEditor);
