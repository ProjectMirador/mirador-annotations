import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Editor, EditorState, RichUtils } from 'draft-js';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import BoldIcon from '@material-ui/icons/FormatBold';
import ItalicIcon from '@material-ui/icons/FormatItalic';
import { stateToHTML } from 'draft-js-export-html';

/** */
class TextEditor extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };
    this.onChange = this.onChange.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.handleFormating = this.handleFormating.bind(this);
  }

  /** */
  onChange(editorState) {
    const { updateAnnotationBody } = this.props;
    this.setState({ editorState });
    console.log(this.props);
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
  render() {
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
        <Editor
          editorState={editorState}
          handleKeyCommand={this.handleKeyCommand}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

TextEditor.propTypes = {
  updateAnnotationBody: PropTypes.func,
};

TextEditor.defaultProps = {
  updateAnnotationBody: () => {},
};

export default TextEditor;
