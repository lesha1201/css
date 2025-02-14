import Tabs, { Tab, TabBadge } from 'shared/components/Tabs'
import { queryDictionary } from 'shared/dictionaries';
import DocLayout from '~/layouts/doc'
import NextjsSvg from 'shared/images/frameworks/nextjs.svg'

export default async function Layout(props: any) {
    const $ = await queryDictionary(props.params.locale)
    return (
        /* @ts-expect-error server component */
        <DocLayout {...props}
            metadata={{
                title: 'Set up Master CSS in Next.js',
                description: 'Guide to setting up Master CSS in your Next.js project.',
                category: 'Installation'
            }}
            backOnClickCategory='/docs/installation'
            icon={{
                Element: NextjsSvg,
                class: 'w:100 invert(1)@dark'
            }}
        >
            <Tabs className="mb:30">
                <Tab href='/docs/installation/nextjs'>{$('Progressive Rendering')} <TabBadge>{$('Recommanded')}</TabBadge></Tab>
                <Tab href='/docs/installation/nextjs/runtime-rendering'>{$('Runtime Rendering')}</Tab>
                <Tab href='/docs/installation/nextjs/static-extraction'>{$('Static Extraction')}</Tab>
            </Tabs>
            {props.children}
        </DocLayout >
    )
}