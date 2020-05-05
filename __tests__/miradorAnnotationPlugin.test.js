import React from 'react';
import { shallow } from 'enzyme';
import miradorAnnotationPlugin from '../src/plugins/miradorAnnotationPlugin';

/** */
function createWrapper(props) {
  return shallow(
    <miradorAnnotationPlugin.component
      TargetComponent={'<div>hello</div>'}
      targetProps={{}}
      {...props}
    />,
  );
}

describe('MiradorAnnotation', () => {
  let wrapper;
  it('renders MiradorAnnotation', () => {
    wrapper = createWrapper();
    expect(wrapper.text()).toBe('HelloWorld');
  });
});
