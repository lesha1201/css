import Tabs, { Tab } from 'shared/components/Tabs'
import { queryDictionary } from 'shared/dictionaries';
import DocLayout from '~/layouts/doc'
import metadata from './metadata';

export default async function Layout(props: any) {
    const $ = await queryDictionary(props.params.locale)
    return (
        /* @ts-expect-error server component */
        <DocLayout {...props} metadata={metadata}>
            <Tabs className="mb:30">
                <Tab href='/docs/configuration'>{$('Overview')}</Tab>
                <Tab href='/docs/configuration/setup'>{$('Setup')}</Tab>
                <Tab href='/docs/configuration/authoring' disabled>{$('Authoring')}</Tab>
            </Tabs>
            {props.children}
        </DocLayout >
    )
}