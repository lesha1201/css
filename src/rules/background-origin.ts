import { MasterCSSRule } from '../rule';
import { BACKGROUND, BORDER, BOX, CONTENT, dash, ORIGIN, PADDING } from '../constants/css-property-keyword';

export class BackgroundOrigin extends MasterCSSRule {
    static override matches = /^(bg|background):(content|border|padding)(?!\|)/;
    static override key = dash(BACKGROUND, ORIGIN);
    static override values = {
        content: dash(CONTENT, BOX),
        border: dash(BORDER, BOX),
        padding: dash(PADDING, BOX)
    }
}