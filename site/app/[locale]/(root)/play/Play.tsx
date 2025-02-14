'use client'

import Editor, { type Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { customAlphabet } from 'nanoid'
import { debounce } from 'throttle-debounce';
import { snackbar } from 'shared/utils/snackbar'
import copy from 'copy-to-clipboard'
// import ThemeButton from 'shared/components/ThemeButton'
import dedent from 'ts-dedent'
// import DocHeader from 'shared/layouts/Doc/DocHeader'
import { IconBrandCss3, IconChevronDown, IconDeviceDesktop, IconDeviceMobile } from '@tabler/icons-react'
import Tabs, { Tab } from 'shared/components/Tabs'
import { l } from 'to-line'
// import { Button } from 'shared/components/App/AppBtn'
import { usePathname, useRouter } from 'next/navigation'
import LanguageButton from 'shared/components/LanguageButton';
import previewHandlerScriptText from './previewHandler.js?text'
import ThemeButton from 'shared/components/ThemeButton';
import Button from 'shared/components/Button'
import { getScriptHTML } from './getScriptHTML';
import { getStyleHTML } from './getStyleHTML';
import { beautifyCSS } from 'shared/utils/beautifyCSS'
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 14)
import templates from './templates';
import { latestMasterCSSVersion } from 'shared/utils/latestMasterCSSVersion';
import { useSearchParams } from 'next/navigation';
import Resizable from 'shared/components/Resizable';
import { getLinkHTML } from './getLinkHTML';
/* 與本地 css 專案即時測試用 */
// import { useTheme } from '../../../../../css/packages/react/src'
import { useThemeService } from '@master/css.react'
import cloneDeep from 'clone-deep'
import { Logotype } from '~/components/Logotype';
import Header, { HeaderNav } from 'shared/components/Header'
import links from '~/links.mjs'
import dynamic from 'next/dynamic'
import i18n from 'shared/i18n.config.mjs'
import { mediaQueries } from '@master/css'

// import { Registry } from 'monaco-textmate'
// import { wireTmGrammars } from 'monaco-editor-textmate'

// loader.config({
//     paths: {
//         vs: '/monaco-editor/vs',
//     }
// })

const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    readOnly: false,
    minimap: {
        enabled: false,
    },
    padding: {
        top: 20,
        bottom: 20,
    },
    scrollBeyondLastLine: false,
    wrappingStrategy: 'advanced',
    overviewRulerLanes: 0,
    lineHeight: 22,
    fontSize: 14,
    fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
}

const editorHTMLOptions: any = {
    format: {
        wrapLineLength: 0
    }
}

export default function Play(props: any) {
    const { dict } = props
    const router = useRouter()
    const themeService = useThemeService()
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const versionSelectRef = useRef<HTMLSelectElement>(null)
    const monacoProvidersRef = useRef<any>([])
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const monacoRef = useRef<Monaco | null>(null)
    const previewIframeRef = useRef<HTMLIFrameElement>(null)
    const prevVersionRef = useRef(props.shareItem?.version ?? latestMasterCSSVersion)
    const [layout, setLayout] = useState<string | null>(searchParams.get('layout'))
    const [preview, setPreview] = useState<string | null>(searchParams.get('preview'))
    const [shareId, setShareId] = useState(props.shareId ?? '')
    const [sharing, setSharing] = useState(false)
    const [version, setVersion] = useState(props.shareItem?.version ?? latestMasterCSSVersion)
    const [generatedCssText, setGeneratedCssText] = useState('')
    const template = useMemo(() => templates.find((eachTemplate) => eachTemplate.version === version), [version])
    const [previewErrorEvent, setPreviewErrorEvent] = useState<any>()
    const shareItem: PlayShare = useMemo(() => {
        if (props.shareItem && props.shareItem.version === version) {
            props.shareItem.files
                .forEach((eachFile: PlayShareFile) => {
                    eachFile.content = (eachFile.content || '').replace(/\\n/g, '\n')
                })
            return props.shareItem
        } else {
            return {
                files: props.shareItem?.files ?? cloneDeep(template?.files),
                dependencies: cloneDeep(template?.dependencies),
                version: latestMasterCSSVersion,
                links: cloneDeep(template?.links)
            }
        }
    }, [props.shareItem, template?.dependencies, template?.files, template?.links, version])

    const [currentTabTitle, setCurrentTabTitle] = useState<any>(
        shareItem.files.find(({ title }) => searchParams.get('tab') === title)
            ? searchParams.get('tab')
            : shareItem.files[0].title
    )
    const editorModelRef = useRef<Record<string, editor.IModel | undefined>>({})
    const generateDatabaseShareItem = useCallback((target: any) => ({
        files: target.files,
        dependencies: template?.dependencies,
        version
    }), [template?.dependencies, version])

    const [strignifiedPrevShareItem, setStrignifiedPrevShareItem] = useState(JSON.stringify(generateDatabaseShareItem(shareItem)))
    const [shareable, setShareable] = useState(false)

    useEffect(() => {
        if (prevVersionRef.current !== version) {
            prevVersionRef.current = version
            setStrignifiedPrevShareItem(JSON.stringify(generateDatabaseShareItem(shareItem)))
            setShareable(false)
        }
    }, [generateDatabaseShareItem, shareItem, version])

    const validateShareable = useCallback(() => {
        const databaseShareItem = generateDatabaseShareItem(shareItem)
        const strignifiedDatabaseShareItem = JSON.stringify(databaseShareItem)
        setShareable(strignifiedDatabaseShareItem !== strignifiedPrevShareItem)
    }, [generateDatabaseShareItem, shareItem, strignifiedPrevShareItem])

    const createQueryString = useCallback(
        (name: string, value: any) => {
            const params = new URLSearchParams(searchParams);
            if (!value) {
                params.delete(name)
            } else {
                params.set(name, value);
            }

            return params.toString();
        },
        [searchParams],
    );

    useEffect(() => {
        const queryLayout = searchParams.get('layout')
        const queryPreview = searchParams.get('preview')
        const queryTab = searchParams.get('tab')
        if (queryLayout) {
            setLayout(queryLayout)
        }
        if (queryPreview) {
            setPreview(queryPreview)
        }
        if ([...shareItem.files.map(({ title }) => title)].includes(queryTab || '')) {
            setCurrentTabTitle(queryTab)
        } else {
            setCurrentTabTitle(shareItem.files[0].title)
        }
    }, [createQueryString, pathname, router, searchParams, shareItem.files])

    /**
     * 避免切換到更大視口時仍停留在僅小視口支援的 Preview 或 Generated CSS 瀏覽模式
     */
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= mediaQueries.md) {
                if (currentTabTitle === 'Preview' || currentTabTitle === 'Generated CSS') {
                    setCurrentTabTitle(shareItem.files[0].title)
                }
            }
        }
        window.addEventListener('resize', onResize, { passive: true })
        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [currentTabTitle, shareItem.files])

    useEffect(() => {
        if (searchParams.get('layout') !== layout) {
            router.push(pathname + '?' + createQueryString('layout', layout))
        }
    }, [createQueryString, layout, pathname, router, searchParams, shareId])

    useEffect(() => {
        if (searchParams.get('preview') !== preview) {
            router.push(pathname + '?' + createQueryString('preview', preview))
        }
    }, [createQueryString, pathname, preview, router, searchParams, shareId])

    /**
     * 需避免即時編輯 HTML, Config 或切換 Theme 時更新 previewHTML，否則 Preview 將重載並造成視覺閃爍
     */
    const previewHTML = useMemo(() => {
        let headInnerHTML = ''
        let bodyInnerHTML = ''

        const appendFile = (eachFile: PlayShareFile) => {
            let content = eachFile.content;
            if (!content) {
                return
            }
            const eachTemplateFile: any = template?.files.find(({ title }: any) => title === eachFile.title)
            switch (eachTemplateFile?.language) {
                case 'html':
                    bodyInnerHTML += content
                    return
                case 'javascript':
                    let eachScriptHTML = getScriptHTML({ ...eachTemplateFile, text: content })
                    if (eachFile.name === 'master.css.js') {
                        eachScriptHTML = eachScriptHTML
                            .replace(/(export default|export const config =)/, 'window.masterCSSConfig =')
                    }
                    headInnerHTML += eachScriptHTML
                    break
                case 'css':
                    headInnerHTML += getStyleHTML({ ...eachTemplateFile, text: content })
                    break
            }
        }

        shareItem.files
            .filter((eachFile) => eachFile.priority === 'low')
            .filter((eachFile) => appendFile(eachFile))

        shareItem?.links?.forEach((link) => {
            headInnerHTML += getLinkHTML(link)
        })

        shareItem?.dependencies?.styles
            ?.forEach((style) => {
                headInnerHTML += getStyleHTML(style)
            })

        shareItem?.dependencies?.scripts
            ?.forEach((script) => {
                headInnerHTML += getScriptHTML(script)
            })

        shareItem.files
            .filter((eachFile) => eachFile.priority !== 'low')
            .filter((eachFile) => appendFile(eachFile))

        return dedent`<html>
            <head>
                <link rel="stylesheet" href="/fonts/fira-code.css">
                <link rel="stylesheet" href="/fonts/inter.css">
                <script>${previewHandlerScriptText}</script>
                <style>body { font-family: Inter var, Noto Sans TC, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" }</style>
                ${headInnerHTML}
            </head>
            <body>${bodyInnerHTML}</body>
        </html>`
    }, [shareItem?.dependencies?.scripts, shareItem?.dependencies?.styles, shareItem.files, shareItem?.links, template?.files])

    const currentCodeTab: { id: string, language: string, content: string, readOnly: boolean, name: string, title: string } = useMemo(() => {
        switch (currentTabTitle) {
            // mobile
            case 'Generated CSS':
                return {
                    id: 'GeneratedCSS',
                    title: 'Generated CSS',
                    name: 'master.css',
                    language: 'css',
                    content: generatedCssText,
                    readOnly: true
                }
            // mobile
            case 'Preview':
                return shareItem.files[0]
            default:
                return shareItem.files.find((eachTab: any) => eachTab.title === currentTabTitle) as any
        }
    }, [currentTabTitle, generatedCssText, shareItem.files])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const hotUpdatePreviewByFile = useCallback(debounce(250, () => {
        if (editorRef.current) {
            currentCodeTab.content = editorRef.current?.getValue()
            validateShareable()
        }

        previewIframeRef?.current?.contentWindow?.postMessage({
            id: currentCodeTab.id,
            language: currentCodeTab.language,
            name: currentCodeTab.name,
            title: currentCodeTab.title,
            content: currentCodeTab.content
        }, window.location.origin)

        setTimeout(() => {
            setPreviewErrorEvent(null)
        })
    }), [currentCodeTab, validateShareable])

    const editorOnChange = useCallback(() => {
        hotUpdatePreviewByFile()
    }, [hotUpdatePreviewByFile])

    /**
     * 手動更新 editor value，不要使用 value={currentCodeTab.value}
     */
    useEffect(() => {
        if (currentTabTitle !== 'Preview' && editorRef.current && monacoRef.current) {
            const content = currentTabTitle === 'Generated CSS' ? generatedCssText : currentCodeTab.content
            let currentEditorModel: any = editorModelRef.current?.[currentCodeTab.id]
            if (currentEditorModel) {
                if (currentEditorModel.getValue() !== content) {
                    currentEditorModel.setValue(content)
                }
            } else {
                currentEditorModel
                    = editorModelRef.current[currentCodeTab.id]
                    = monacoRef.current?.editor.createModel(content, currentCodeTab.language) as editor.ITextModel
            }

            if (editorRef.current.getValue() !== content) {
                editorRef.current.setModel(currentEditorModel)
            }

            /* 取消因上文觸發 hotUpdatePreviewByFile() */
            hotUpdatePreviewByFile.cancel({ upcomingOnly: true })
        }
    }, [currentCodeTab, currentTabTitle, generatedCssText, hotUpdatePreviewByFile, shareItem.files])

    // dispose monaco providers
    useEffect(() => {
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            monacoProvidersRef.current.forEach((provider: any) => {
                provider.dispose()
            })
            editorRef.current?.dispose();

        };
    }, []);

    useEffect(() => {
        const onUnload = (e: any) => {
            e.preventDefault()
            if (shareable) {
                e.returnValue = ''
            }
        }
        const onMessage = (event: MessageEvent) => {
            const { type, content } = event.data
            if (event.origin !== document.location.origin) {
                return
            }
            switch (type) {
                case 'cssUpdate':
                    const cssText = content ? beautifyCSS(content) : ''
                    setGeneratedCssText(cssText)
                    break;
                case 'error':
                    setPreviewErrorEvent(event.data)
                    break;
            }
        }
        const initialErrorEvent = (window as any).__SANDBOX_INITIAL_ERROR_EVENT
        if (initialErrorEvent) {
            setPreviewErrorEvent(initialErrorEvent)
            delete (window as any).__SANDBOX_INITIAL_ERROR_EVENT
        }
        window.addEventListener('beforeunload', onUnload)
        window.addEventListener('message', onMessage)
        return () => {
            window.removeEventListener('beforeunload', onUnload)
            window.removeEventListener('message', onMessage)
        }
    }, [shareable])

    const copyLink = useCallback(() => {
        snackbar('Share link copied!')
        copy(window.location.href)
    }, [])

    const share = useCallback(async () => {
        if (!shareable) {
            return
        }
        setSharing(true)
        let newShareId = nanoid()
        const databaseShareItem = generateDatabaseShareItem(shareItem)
        await fetch(`${window.location.origin}/play/api`, {
            body: JSON.stringify({
                id: newShareId,
                data: databaseShareItem
            }),
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            }),
        })
        router.push(`${props.locale === i18n.defaultLocale ? '' : `/${props.locale}`}/play/${newShareId}${window.location.search}`)
        setShareId(newShareId)
        copyLink()
        setStrignifiedPrevShareItem(JSON.stringify(databaseShareItem))
        setShareable(false)
        setSharing(false)
    }, [copyLink, generateDatabaseShareItem, props.locale, router, shareItem, shareable])

    const responsive = useMemo(() => {
        return preview === 'responsive'
            // 避免在 @<md 時觸發響應式預覽
            && currentTabTitle !== 'Preview'
    }, [currentTabTitle, preview])

    // change version
    const onVersionSelectChange = (event: any) => {
        if (shareable) {
            if (!window.confirm('Are you sure you want to discard the current changes?') ?? '') {
                event.preventDefault()
                return
            }
        }
        setVersion(event.target.value)
    }

    const editorOnMount = async (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        // TODO: 須確認是否可由 @monaco-editor/react 的相關 API 改寫，不要用 monaco-editor
        const { languages } = await import('monaco-editor')
        editorRef.current = editor
        monacoRef.current = monaco

        languages.html.htmlDefaults.setOptions(editorHTMLOptions)

        // const {
        //     CompletionItemProvider,
        //     ColorPresentationProvider,
        //     DocumentColorsProvider,
        //     HoverItemProvider
        // } = await import('./master-css-monaco')

        // monacoProvidersRef.current.push(languages.registerCompletionItemProvider('html', {
        //     provideCompletionItems: function (model, position) {
        //         return CompletionItemProvider(model, position, 'html')
        //     },
        //     triggerCharacters: [':', '@', '~'],
        // }))

        // monacoProvidersRef.current.push(languages.registerCompletionItemProvider('javascript', {
        //     provideCompletionItems: function (model, position) {
        //         return CompletionItemProvider(model, position, 'javascript')
        //     },
        //     triggerCharacters: [':', '@', '~'],
        // }))

        // monacoProvidersRef.current.push(languages.registerHoverProvider('html', {
        //     provideHover: function (model, position) {
        //         var result = HoverItemProvider(position, model)
        //         if (result != null) {
        //             return result
        //         }
        //     },
        // }))

        // monacoProvidersRef.current.push(languages.registerColorProvider('html', {
        //     provideColorPresentations(model, colorInfo) {
        //         return ColorPresentationProvider(model, colorInfo)
        //     },

        //     provideDocumentColors(model, token) {
        //         return DocumentColorsProvider(model)
        //     },
        // }))

        // monacoProvidersRef.current.push(languages.registerColorProvider('javascript', {
        //     provideColorPresentations(model, colorInfo) {
        //         return ColorPresentationProvider(model, colorInfo)
        //     },

        //     provideDocumentColors(model, token) {
        //         return DocumentColorsProvider(model)
        //     },
        // }))

        // languages.register({ id: 'master-css' })
        // languages.register({ id: 'master-css-injection-class' })

        // const registry = new Registry({
        //     getGrammarDefinition: async (scopeName) => {
        //         switch (scopeName) {
        //             case 'source.master-css':
        //                 return {
        //                     format: 'json',
        //                     content: await (await fetch('/tmLanguage/master-css.tmLanguage.json')).text(),
        //                 }
        //             case 'source.master-css.injection-class':
        //                 return {
        //                     format: 'json',
        //                     content: await (await fetch('/tmLanguage/master-css.injection-class.tmLanguage.json')).text(),
        //                 }
        //             case 'source.master-css.injection-js':
        //                 return {
        //                     format: 'json',
        //                     content: await (await fetch('/tmLanguage/master-css.injection-js.tmLanguage.json')).text(),
        //                 }
        //             case 'source.master-css.injection-string':
        //                 return {
        //                     format: 'json',
        //                     content: await (await fetch('/tmLanguage/master-css.injection-string.tmLanguage.json')).text(),
        //                 }
        //             default:
        //                 return null
        //         }
        //     },
        //     getInjections(scopeName: ScopeName): string[] | undefined {
        //         switch (scopeName) {
        //             case 'source.master-css.injection-class':
        //                 return [
        //                     "source",
        //                     "text"
        //                 ]
        //             case 'source.master-css.injection-js':
        //                 return [
        //                     "source.js",
        //                     "source.ts"
        //                 ]
        //             case 'source.master-css.injection-string':
        //                 return [
        //                     "source.js",
        //                     "source.ts"
        //                 ]
        //             default:
        //                 return undefined
        //         }
        //         const grammar = grammars[scopeName];
        //         return grammar ? grammar.injections : undefined;
        //     },
        // })
        // const grammars = new Map()
        // grammars.set('master-css', 'source.master-css')
        // await wireTmGrammars(monaco, registry, grammars, editor)
        // const grammar = await registry.loadGrammar(languages.get(languageId))

        // languages.setTokensProvider(languageId, {
        //     getInitialState: () => new TokenizerState(INITIAL),
        //     tokenize: (line: string, state: TokenizerState) => {
        //         const res = grammar.tokenizeLine(line, state.ruleStack)
        //         return {
        //             endState: new TokenizerState(res.ruleStack),
        //             tokens: res.tokens.map(token => ({
        //                 ...token,
        //                 // TODO: At the moment, monaco-editor doesn't seem to accept array of scopes
        //                 scopes: editor ? TMToMonacoToken(editor, token.scopes) : token.scopes[token.scopes.length - 1]
        //             })),
        //         }
        //     }
        // })

        previewIframeRef?.current?.contentWindow?.postMessage({ type: 'editorReady' }, window.location.origin)
    }

    const width = useMemo(() => (!layout || layout === '2') ? '50%' : '100%', [layout])
    const height = useMemo(() => (!layout || layout === '2') ? '100%' : '50%', [layout])

    return (
        <div className="abs flex full flex:col">
            <Header fixed={false} Logotype={Logotype}>
                <label className='rel gap:5 ml:30 app-header-nav'>
                    v{version}
                    <select ref={versionSelectRef} name="version" defaultValue={version}
                        className="abs full cursor:pointer inset:0 opacity:0"
                        onChange={onVersionSelectChange}>
                        {templates.map(({ version: eachVersion }) => (
                            <option value={eachVersion} key={eachVersion}>v{eachVersion}</option>
                        ))}
                        {
                            shareItem?.version && !templates.find((eachTemplate) => eachTemplate.version === version)
                            && <option value={shareItem.version} disabled>
                                v{shareItem?.version}
                            </option>
                        }
                    </select>
                    <IconChevronDown className="1emx1em mr:-3 stroke:1.3" />
                </label>
                {links?.map((eachLink: any) => <HeaderNav key={eachLink.name} {...eachLink} onClick={(event: any) => {
                    if (shareable) {
                        if (!window.confirm('Are you sure to go to another page and discard current changes?')) {
                            event.preventDefault()
                            return
                        }
                    }
                }}>{dict[eachLink.name] || eachLink.name}</HeaderNav>)}
                <div className="flex align-items:center ml:auto mr:-12">
                    {/* copy share link */}
                    {(shareId && !shareable) && <button className="hide@<md mx:12 w:auto! app-header-icon" onClick={copyLink}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M9 15l6 -6"></path>
                            <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"></path>
                            <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"></path>
                        </svg>
                        <span className="font:12 ls:0 ml:10">
                            {shareId}
                        </span>
                    </button>}
                    {/* share button */}
                    {shareable && <button className={l('hide@<md', sharing ? 'app-header-nav' : 'app-header-icon')} onClick={share} disabled={sharing}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M8 9h-1a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-8a2 2 0 0 0 -2 -2h-1" className="fill:dim/.2"></path>
                            <path d="M12 14v-11"></path>
                            <path d="M9 6l3 -3l3 3"></path>
                        </svg>
                        {sharing && <span className="ml:10">
                            {dict['Sharing ...']}
                        </span>}
                    </button>}
                    {(shareId || shareable) && <div className='hide@<md bg:white/.1@dark bg:slate-90@light h:1em mx:15 w:1'></div>}
                    <button className="hide@<md app-header-icon" onClick={(event) => (setLayout(layout ? null : '2'))}>
                        <svg className={l({ 'stroke:accent': !layout || layout === '2' })} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path className={l(
                                '~transform|.2s',
                                (!layout || layout === '2') ? 'fill:accent/.15' : 'fill:dim/.2',
                                { 'translate(12,4)': !layout }
                            )} stroke="none" d="M1,0H8A0,0,0,0,1,8,0V16a0,0,0,0,1,0,0H0a0,0,0,0,1,0,0V1A1,1,0,0,1,1,0Z" transform='translate(4 4)' />
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                            <path d="M12 4l0 16"></path>
                        </svg>
                    </button>
                    <button className="hide@<md app-header-icon" onClick={(event) => (setLayout(layout === '3' ? '4' : '3'))}>
                        <svg className={l({ 'stroke:accent': layout === '3' || layout === '4' }, 'rotate(90)')} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path className={l(
                                '~transform|.2s',
                                (layout === '3' || layout === '4') ? 'fill:accent/.15' : 'fill:dim/.2',
                                { 'translate(12,4)': layout === '3' }
                            )} stroke="none" d="M1,0H8A0,0,0,0,1,8,0V16a0,0,0,0,1,0,0H0a0,0,0,0,1,0,0V1A1,1,0,0,1,1,0Z" transform='translate(4 4)' />
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                            <path d="M12 4l0 16"></path>
                        </svg>
                    </button>
                    <button className="hide@<md app-header-icon" onClick={(event) => setLayout('5')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={l(layout === '5' && 'stroke:accent')} width="22" height="22" strokeWidth="1.2" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                            <path d="M4 9l16 0"></path>
                            <rect className={layout === '5' ? 'fill:accent/.15' : 'fill:dim/.2'} width="16" height="11" stroke='none' transform="translate(4 9)" />
                        </svg>
                    </button>
                    <div className='hide@<md bg:white/.1@dark bg:slate-90@light h:1em mx:15 w:1'></div>
                    {/* preview: desktop */}
                    <button className="hide@<md app-header-icon" onClick={(event) => setPreview('')}>
                        <IconDeviceDesktop width="22" height="22" className={l(
                            'stroke:current stroke:1.3',
                            !preview ? 'stroke:accent fill:accent/.15' : 'fill:dim/.2'
                        )} />
                    </button>
                    {/* preview: responsive */}
                    <button className="hide@<md app-header-icon" onClick={(event) => setPreview('responsive')}>
                        <IconDeviceMobile width="22" height="22" className={l(
                            'stroke:current stroke:1.3',
                            responsive ? 'stroke:accent fill:accent/.15' : 'fill:dim/.2'
                        )} />
                    </button>
                    {/* preview: css */}
                    <button className="hide@<md app-header-icon" onClick={(event) => setPreview('css')}>
                        <IconBrandCss3 width="22" height="22" className={l(
                            'stroke:current stroke:1.3',
                            preview === 'css' ? 'stroke:accent fill:accent/.15' : 'fill:dim/.2'
                        )} />
                    </button>
                    <div className='hide@<md bg:white/.1@dark bg:slate-90@light h:1em mx:15 w:1'></div>
                    <LanguageButton className="app-header-icon" locale={props.locale} />
                    <ThemeButton className="app-header-icon"
                        onChange={(theme: string) => {
                            previewIframeRef?.current?.contentWindow?.postMessage({
                                theme
                            }, window.location.origin)
                        }}
                    />
                </div>
            </Header >
            <div
                className={l(
                    'flex:col!@<sm flex full flex:1 overflow:hidden bg:transparent_:is(.monaco-editor,.monaco-editor-background,.monaco-editor_.margin)',
                    {
                        'flex:row': !layout,
                        'flex:row-reverse': layout === '2',
                        'flex:col': layout === '3' || layout === '5',
                        'flex:col-reverse': layout === '4'
                    }
                )}
            >
                <Resizable
                    overlay={false}
                    originX={layout === '2' ? 'right' : 'left'}
                    originY={layout === '3' ? 'top' : 'bottom'}
                    handlerStyle="hidden"
                    showHandler={[layout === '4', !layout, layout === '3', layout === '2']}
                    className={l(
                        layout === '5' && 'hide!@md',
                        'b:divider',
                        {
                            'full!@<md': currentTabTitle !== 'Preview',
                            'br:1|solid': !layout,
                            'bl:1|solid': layout === '2',
                            'bb:1|solid': layout === '3',
                            'bt:1|solid': layout === '4'
                        }
                    )}
                    width={currentTabTitle === 'Preview' ? '' : width}
                    height={currentTabTitle === 'Preview' ? '' : height}
                    showHeight={true}
                >
                    <Tabs className="flex:0|0|auto" contentClassName="px:30">
                        {shareItem.files.map((file, index) => (
                            <Tab size="sm" active={currentTabTitle === file.title} key={file.id} onClick={() => {
                                if (index === 0) {
                                    router.push(pathname + '?' + createQueryString('tab', ''));
                                } else {
                                    router.push(pathname + '?' + createQueryString('tab', file.title));
                                }
                                // 不可僅依賴 router push 進行切換
                                setCurrentTabTitle(file.title)
                            }}>
                                {file.title || ''}
                            </Tab>
                        ))}
                        {/* mobile couldn't support tab active */}
                        <Tab size="sm" className="hide@md" active={currentTabTitle === 'Generated CSS'} onClick={() => {
                            // 不可依賴 router push 進行切換
                            setCurrentTabTitle('Generated CSS')
                        }
                        }>
                            Generated CSS
                        </Tab>
                        <Tab className="hide@sm" size="sm" active={currentTabTitle === 'Preview'} onClick={() => {
                            // 不可依賴 router push 進行切換
                            setCurrentTabTitle('Preview')
                        }}>
                            Preview
                        </Tab>
                    </Tabs>
                    <div className='full min-h:0'>
                        <Editor
                            className={l(
                                { 'hide!': currentTabTitle === 'Preview' }
                            )}
                            height="100%"
                            width="100%"
                            theme={'vs-' + themeService?.current}
                            defaultValue={currentCodeTab.content}
                            defaultLanguage={currentCodeTab.language}
                            language={currentCodeTab.language}
                            path={currentTabTitle}
                            options={{
                                ...editorOptions,
                                readOnly: currentCodeTab.readOnly
                            }}
                            onMount={editorOnMount}
                            onChange={editorOnChange}
                        />
                    </div>
                </Resizable>
                <div className={l('rel overflow:hidden flex:1|1|auto bg:gray-10@dark bg:slate-95@light', {
                    'flex jc:center p:32': responsive,
                    'pt:64': responsive && layout !== '3',
                    'pb:64': responsive && layout === '3',
                    'hide@<md': currentTabTitle !== 'Preview'
                })}>
                    <Resizable
                        ruleClassName={'abs'}
                        showRuler={responsive && 'always'}
                        rulerPlacement={layout === '3' ? 'bottom' : 'top'}
                        width={responsive ? '490px' : null}
                        height={responsive ? '680px' : null}
                        overlay={false}
                        originX={'center'}
                        showHandler={responsive ? [false, true, true] : false}
                        className={l(
                            'full',
                            {
                                'max-w:100% max-h:100% outline:1|solid|divider': responsive
                            }
                        )}
                        showHeight={true}
                    >
                        <iframe ref={previewIframeRef}
                            className={l('demo', { hide: preview === 'css' })}
                            style={{ width: '100%', height: '100%', borderRadius: 0, margin: 0, padding: 0, border: 0 }}
                            sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-same-origin allow-pointer-lock allow-top-navigation allow-modals"
                            srcDoc={previewHTML}
                        />
                        <Editor
                            wrapperProps={{ className: l({ 'hide!': preview !== 'css' }) }}
                            height="100%"
                            width="100%"
                            theme={'vs-' + themeService?.current}
                            defaultValue={generatedCssText}
                            value={generatedCssText}
                            language="css"
                            options={{
                                ...editorOptions,
                                readOnly: true
                            }}
                        />
                        {previewErrorEvent &&
                            <div className="abs full bg:red-10@dark bg:red-95@light fg:red-75@dark fg:red@light inset:0 p:50">
                                <h2 className="font:20">Error at line {previewErrorEvent.lineno === 1 ? 1 : previewErrorEvent.lineno - 1}</h2>
                                <div className="bg:black/.2@dark bg:red-90@light r:5 font:14 font:medium my:20 p:15|20">
                                    {previewErrorEvent.message}
                                </div>
                                <div className="font:12">{previewErrorEvent.datetime.toLocaleTimeString()} {previewErrorEvent.datetime.toDateString()}, {previewErrorEvent.filename}</div>
                            </div>
                        }
                    </Resizable>
                </div>
            </div>
        </div >
    )
}

export interface PlayShare {
    files: PlayShareFile[]
    dependencies: PlayShareDependencies
    version: string
    links: string[]
}

export interface PlayShareFile {
    title?: string
    name?: string
    language?: 'html' | 'javascript' | 'css' | 'plaintext'
    path?: string
    content?: string
    priority?: 'low'
    id?: string
}

export interface PlayShareDependencies {
    styles: any[]
    scripts: any[]
}
