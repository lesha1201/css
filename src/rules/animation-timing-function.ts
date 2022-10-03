import { ANIMATION, dash, TIMING_FUNCTION } from '../constants/css-property-keyword';
import { MasterCSSRule } from '../rule';

export class AnimationTimingFunction extends MasterCSSRule {
    static override matches = /^\@easing:./;
    static override key = dash(ANIMATION, TIMING_FUNCTION);
}