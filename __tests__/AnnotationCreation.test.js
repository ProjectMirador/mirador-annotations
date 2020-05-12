import React from 'react';
import { shallow } from 'enzyme';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import AnnotationCreation from '../src/AnnotationCreation';

/** */
function createWrapper(props) {
  return shallow(
    <AnnotationCreation
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
    expect(wrapper.find('form').length).toBe(1);
  });
  it('form has button toggles', () => {
    wrapper = createWrapper();
    expect(wrapper.find(ToggleButtonGroup).length).toBe(1);
  });
});
