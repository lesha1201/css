import { MasterStyle } from '@master/style';
import { BORDER, COLOR, DASH } from './constants/css-property-keyword';

export class BorderColorStyle extends MasterStyle {
    static override prefixes = /^b(order)?-color:/;
    static override properties = [BORDER + DASH + COLOR];
    static override supportFullName = false;
}