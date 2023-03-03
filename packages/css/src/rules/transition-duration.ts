import { Rule } from '../'

export default class extends Rule {
    static override id = 'TransitionDuration' as const
    static override matches = '^~duration:.'
    static override unit = 'ms'
}