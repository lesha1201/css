import CSSExtractor from '@master/css-extractor'
import type { Options } from '@master/css-extractor'
import type { Plugin } from 'vite'
import { Pattern } from 'fast-glob'
import PreInsertionPlugin from './pre-insertion'
import HMRPlugin from './hmr-plugin'
import VirtualCSSModulePlugins from './virtual-css-module'

export default function CSSExtractorPlugin(
    customOptions?: Options | Pattern | Pattern[]
): Plugin[] {
    const extractor = new CSSExtractor(customOptions)
    extractor.on('init', (options: Options) => {
        options.include = []
    })
    extractor.init()
    return [
        HMRPlugin(extractor),
        PreInsertionPlugin(extractor),
        ...VirtualCSSModulePlugins(extractor),
    ]
}