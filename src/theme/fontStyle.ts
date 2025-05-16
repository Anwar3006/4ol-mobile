import {Dimensions} from 'react-native';
import {fontSize} from '../responsive';
const size = {
  xs: fontSize(10),
  s: fontSize(12),
  sl: fontSize(13),
  default: fontSize(14),
  md: fontSize(16),
  lg: fontSize(18),
  xlg: fontSize(22),
  vxlg: fontSize(24),
  xxlg: fontSize(30),
  extraxlg: fontSize(42),
  xxxlg: fontSize(48),
};
export {size};

export const {width, height} = Dimensions.get('window');
