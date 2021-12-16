import { MasterStyle } from '@master/style';
import { BACKGROUND, DASH, POSITION } from './constants/css-property-keyword';

export class BackgroundPositionStyle extends MasterStyle {
    static override prefixes =  /^((bg|background)-position:|(bg|background):(top|bottom|right|left|center))/;
    static override properties = [BACKGROUND + DASH + POSITION];
    static override supportFullName = false;
}