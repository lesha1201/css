import { Rule } from '../'

export default class extends Rule {
    static override id = 'GridColumnStart' as const
    static override matches = '^grid-col-start:.'
    static override unit = ''
}