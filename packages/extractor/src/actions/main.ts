import { Options } from '../options'
import CSSExtractor from '../core'
import log from '@techor/log'

module.exports = async function action(specifiedSourcePaths: string[], options?: {
    watch?: boolean,
    output?: string,
    verbose?: number,
    cwd?: string,
    options?: string | string[] | Options
}): Promise<CSSExtractor> {
    const { watch, output, verbose, cwd, options: customOptions } = options
    const extractor = new CSSExtractor(customOptions, cwd)
    extractor.on('init', (options: Options) => {
        if (specifiedSourcePaths?.length) {
            options.include = []
            options.exclude = []
        } else {
            if (!options.exclude.includes('**/node_modules/**')) {
                options.exclude.push('**/node_modules/**')
            }
            if (!options.exclude.includes('node_modules')) {
                options.exclude.push('node_modules')
            }
        }
        options.output = output
        options.verbose = +verbose || options.verbose
    })
    extractor.init()
    const insert = async () => {
        /**
         * true: Ignore `.include` and `.exclude` when specifying sources explicitly.
         * else: Insert according to the source of `.include` - `.exclude`.
         */
        if (specifiedSourcePaths?.length) {
            await extractor.insertFiles(specifiedSourcePaths)
        } else {
            await extractor.insertFiles(extractor.allowedSourcePaths)
        }
    }

    if (watch) {
        const reset = async () => {
            await insert()
            /* If the specified source does not exist, watch the .include - .exclude */
            if (!specifiedSourcePaths?.length) {
                await extractor.watchSource(extractor.options.include, { ignored: extractor.options.exclude })
            }
        }
        extractor
            .on('watchStart', async () => {
                await extractor.prepare()
                await reset()
                log``
                log.t`Start watching source changes`
            })
            .on('reset', async () => {
                await reset()
                log``
                log.t`Restart watching source changes`
            })
            .on('change', () => {
                extractor.export()
            })
            .on('watchClose', () => {
                log``
                log.t`Stop watching source changes`
            })
        await extractor.startWatch()
    } else {
        await extractor.prepare()
        await insert()
        extractor.export()
    }
    return extractor
} 