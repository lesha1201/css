export declare interface Options {
    default?: ThemeValue
    store?: string | false
    init?: boolean
}

export const options: Options = {
    store: 'theme',
    init: true
}

export default options

export declare type ThemeValue = 'dark' | 'light' | 'system' | string