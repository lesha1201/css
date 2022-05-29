import { Style } from '../style';
import { AUTO } from '../constants/css-property-keyword';

export class Inset extends Style {
    static override matches = /^(?:top|bottom|left|right):./;
    static override key = 'inset';
    override get props(): { [key: string]: any } {
        return {
            [this.prefix.slice(0, -1)]: this
        }
    }
}