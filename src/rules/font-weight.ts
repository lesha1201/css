import { dash, FONT, WEIGHT } from '../constants/css-property-keyword';
import { MasterCSSRule } from '../rule';

export class FontWeight extends MasterCSSRule {
    static override matches = /^f(ont)?:(thin|extralight|light|regular|medium|semibold|bold|bolder|extrabold|heavy)(?!\|)/;
    static override key = dash(FONT, WEIGHT);
    static override unit = '';
    static override values = {
        thin: 100,
        extralight: 200,
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        heavy: 900
    };
}