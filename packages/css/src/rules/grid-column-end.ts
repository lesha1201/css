import { Rule } from '../'

export default class extends Rule {
    static override id = 'GridColumnEnd' as const
    static override matches = '^grid-col-end:.'
    static override unit = ''
}