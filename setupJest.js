import Enzyme from 'enzyme'; // eslint-disable-line import/no-extraneous-dependencies
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'; // eslint-disable-line import/no-extraneous-dependencies

Enzyme.configure({ adapter: new Adapter() });
