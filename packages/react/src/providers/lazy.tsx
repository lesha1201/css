import type { MasterCSS, Config } from '@master/css'
import { ReactElement, useEffect, useState } from 'react'
import { CSSContext } from '../contexts'

export const CSSLazyProvider = ({
    children,
    config,
    root = typeof document !== 'undefined' ? document : null
}: {
    children: ReactElement,
    config?: Config | Promise<any>,
    root?: Document | ShadowRoot | null
}) => {
    const [css, setCSS] = useState<MasterCSS>()
    useEffect(() => {
        if (!css) {
            Promise.all([import('@master/css'), config])
                .then(([{ MasterCSS }, configModule]) => {
                    const { instances } = MasterCSS
                    const existingCSS = instances.find((eachCSS) => eachCSS.root === root)
                    if (existingCSS) {
                        setCSS(existingCSS)
                    } else {
                        const resolvedConfig = configModule.config || configModule.default || configModule
                        setCSS(new MasterCSS({ ...resolvedConfig }))
                    }
                })
        }
    }, [config, css, root])
    return <CSSContext.Provider value={css}>{children}</CSSContext.Provider>
}