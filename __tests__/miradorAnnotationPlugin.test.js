import React from 'react';
import { shallow } from 'enzyme';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import miradorAnnotationPlugin from '../src/plugins/miradorAnnotationPlugin';
import AnnotationCreation from '../src/AnnotationCreation';

/** */
function createWrapper(props) {
  return shallow(
    <miradorAnnotationPlugin.component
      TargetComponent={'<div>hello</div>'}
      targetProps={{}}
      addCompanionWindow={jest.fn()}
      {...props}
    />,
  );
}

describe('MiradorAnnotation', () => {
  let wrapper;
  it('renders a create new button', () => {
    wrapper = createWrapper();
    expect(wrapper.find(MiradorMenuButton).props()['aria-label']).toBe('Create new annotation');
  });
  it('opens a new companionWindow when clicked', () => {
    const mockAddCompanionWindow = jest.fn();
    wrapper = createWrapper({
      addCompanionWindow: mockAddCompanionWindow,
    });
    wrapper.find(MiradorMenuButton).simulate('click');
    expect(mockAddCompanionWindow).toHaveBeenCalledWith(
      'custom',
      {
        children: <AnnotationCreation />,
        position: 'right',
        title: 'New annotation',
      },
    );
  });
});
