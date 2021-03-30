import React from 'react';
import { shallow } from 'enzyme';
import MenuItem from '@material-ui/core/MenuItem';
import AnnotationExportDialog from '../src/AnnotationExportDialog';

window.URL.createObjectURL = jest.fn((data) => ('downloadurl'));

const adapter = jest.fn(() => (
  {
    all: jest.fn().mockResolvedValue(
      {
        id: 'pageId/3',
        items: [
          { id: 'anno/2' },
        ],
        type: 'AnnotationPage',
      },
    ),
    annotationPageId: 'pageId/3',
  }
));

/** */
function createWrapper(props) {
  return shallow(
    <AnnotationExportDialog
      canvases={[]}
      config={{ annotation: { adapter } }}
      handleClose={jest.fn()}
      open
      {...props}
    />,
  );
}

describe('AnnotationExportDialog', () => {
  it('renders download link for every annotation page', async () => {
    let wrapper = createWrapper({
      canvases: [
        { id: 'canvas/1' },
        { id: 'canvas/2' },
      ],
    }).dive();
    expect(wrapper.text()).toEqual(expect.stringContaining('No annotations stored yet.'));

    wrapper.instance().componentDidUpdate({ open: false });
    await new Promise((resolve) => setTimeout(resolve, 50));
    wrapper = wrapper.update();
    expect(wrapper.text()).toEqual(expect.not.stringContaining('No annotations stored yet.'));
    expect(wrapper.find(MenuItem).some({ 'aria-label': 'Export annotations for canvas/1' })).toBe(true);
    expect(wrapper.find(MenuItem).some({ 'aria-label': 'Export annotations for canvas/2' })).toBe(true);
  });
});
