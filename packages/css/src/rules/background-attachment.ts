import { Rule } from '../'

export default class extends Rule {
    static override id = 'BackgroundAttachment' as const
    static override matches = '^(?:bg|background):(?:fixed|local|scroll|$values)(?!\\|)'
}