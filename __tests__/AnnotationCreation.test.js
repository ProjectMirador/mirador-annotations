import React from 'react';
import { shallow } from 'enzyme';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import AnnotationCreation from '../src/AnnotationCreation';
import AnnotationDrawing from '../src/AnnotationDrawing';
import TextEditor from '../src/TextEditor';

/** */
function createWrapper(props) {
  return shallow(
    <AnnotationCreation
      id="x"
      config={{}}
      receiveAnnotation={jest.fn()}
      windowId="abc"
      {...props}
    />,
  );
}

describe('AnnotationCreation', () => {
  let wrapper;
  it('renders a form', () => {
    wrapper = createWrapper();
    expect(wrapper.dive().find('form').length).toBe(1);
  });
  it('form has button toggles', () => {
    wrapper = createWrapper();
    expect(wrapper.dive().find(ToggleButtonGroup).length).toBe(3);
  });
  it('adds the AnnotationDrawing component', () => {
    wrapper = createWrapper();
    expect(wrapper.dive().find(AnnotationDrawing).length).toBe(1);
  });
  it('adds the TextEditor component', () => {
    wrapper = createWrapper();
    expect(wrapper.dive().find(TextEditor).length).toBe(1);
  });
  it('can handle annotations without target selector', () => {
    wrapper = createWrapper({
      annotation: {
        body: {
          purpose: 'commenting',
          value: 'Foo bar',
        },
        target: {},
      },
    });
    wrapper.dive();
  });
});
