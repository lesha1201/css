import Rule from '../rule'

export default class extends Rule {
    static override id = 'Order' as const
    static override matches = '^o:.'
    static override unit = ''
}