
import Layout from '~/layouts/doc'
import metadata from './metadata'
import Content from './content.mdx'
import { getSponsorTiers } from 'shared/utils/get-sponsor-tiers'
import Backers from './components/Backers'
import Donors from './components/Donors'
import DonationModal from './components/DonationModal'
import { generate } from '~/utils/metadata'

export async function generateMetadata(props: any, parent: any) {
    return generate(metadata, props, parent)
}

export default async function Page(props: any) {

    const getSponsor = async () => {
        const openCollectiveToken = '7542a8819268783e1eb4f796fbda7f0bbf6793d2'
        const openCollectiveRes = await (await fetch(`https://api.opencollective.com/graphql/v2/${openCollectiveToken}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `{
                            account(slug: "master-co") {
                                members(role: BACKER) {
                                    totalCount
                                    nodes {
                                        updatedAt
                                        role
                                        tier {
                                            name
                                            slug
                                        }
                                        account {
                                            name
                                            slug
                                            imageUrl
                                            description
                                            website
                                            twitterHandle
                                            githubHandle
                                            legalName
                                            longDescription
                                            backgroundImageUrl
                                            currency
                                            expensePolicy
                                        }
                                    }
                                }
                            }
                        }`
            }),
        })).json()

        const openCollectiveMembers = openCollectiveRes?.data?.account?.members?.nodes ?? []

        const githubToken = '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'
        const githubSponsorRes = await (await fetch(
            'https://api.github.com/graphql',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `bearer ${githubToken}`
                },
                body: JSON.stringify({
                    query: `{
                        organization(login: "master-co") {
                            sponsorshipsAsMaintainer(first: 100) {
                                nodes {
                                    tierSelectedAt
                                    tier {
                                        name
                                        description
                                    }
                                    sponsor {
                                        name
                                        login
                                        avatarUrl
                                        websiteUrl
                                        twitterUsername
                                        url
                                        bio
                                        company
                                        email
                                        location
                                        projectsResourcePath
                                        projectsUrl
                                        resourcePath
                                    }
                                }
                            }
                        }
                    }`
                })
            }
        )).json()

        const githubSponsorMembers = githubSponsorRes?.data?.organization?.sponsorshipsAsMaintainer?.nodes ?? []

        const sponsors: any[] = []

        for (const sponsor of openCollectiveMembers) {
            const tierName = sponsor.tier?.name.trim() ? sponsor.tier?.name.trim() : 'freely'
            sponsors.push({
                updatedAt: Math.floor(new Date(sponsor.updatedAt).getTime() / 1000),
                tierName,
                ...sponsor.account,
                avatarUrl: sponsor.account.imageUrl,
                username: sponsor.account.slug,
                websiteUrl: sponsor.account.website,
                twitterUrl: sponsor.account.twitterHandle ? `https://twitter.com/${sponsor.account.twitterHandle}` : null,
                githubUrl: sponsor.account.githubHandle ? `https://github.com/${sponsor.account.githubHandle}` : null,
                from: 'Open Collective',
            })
        }

        for (const sponsor of githubSponsorMembers) {
            const firstLine = sponsor.tier?.description?.split('\n')[0]
            const tierName: string = (firstLine ? firstLine : 'freely')
                .toLowerCase()
                .trim()
                .replace(/\s/g, '-')
                .replace(
                    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
                    ''
                )
                .replace(/\s+/g, ' ')
                .trim()

            sponsors.push({
                updatedAt: Math.floor(new Date(sponsor.tierSelectedAt).getTime() / 1000),
                tierName,
                ...sponsor.sponsor,
                // avatarUrl: sponsor.sponsor.avatarUrl,
                username: sponsor.sponsor.login,
                // websiteUrl: sponsor.sponsor.websiteUrl,
                twitterUrl: sponsor.sponsor.twitterUsername ? `https://twitter.com/${sponsor.sponsor.twitterUsername}` : null,
                githubUrl: sponsor.sponsor.login ? `https://github.com/${sponsor.sponsor.login}` : null,
                from: 'Github Sponsors',
            })
        }

        return sponsors.sort((a, b) => b.updatedAt - a.updatedAt)
    }

    const sponsorsOfLevel: Record<string, any[]> = {}
    const sponsors: any[] = await getSponsor()
    const sponsorTiers = getSponsorTiers('')
    sponsorTiers.forEach((eachSponsorTier) => {
        sponsorsOfLevel[eachSponsorTier.name] = sponsors.filter((eachSponsor) => eachSponsor.tierName === eachSponsorTier.name)
    })

    const backers = sponsors.filter(
        (eachSponsor, index) =>
            sponsors.findIndex(
                (_eachSponsor) => _eachSponsor.username === eachSponsor.username && _eachSponsor.from === eachSponsor.from
            ) === index && !sponsorTiers.map((eachSponsorTier) => eachSponsorTier.name).includes(eachSponsor.tierName)
    )

    return <>
        {/* @ts-expect-error server component */}
        <Layout {...props} metadata={metadata} >
            <div className="flex gap:10 align-items:center mt:80 mb:30">
                <h2 id="backer" className="m:0!">Backer</h2>
                <hr className="my:0! flex:1|1|auto" />
            </div>
            <Backers backers={backers} />
            <Donors sponsorTiers={sponsorTiers} sponsorsOfLevel={sponsorsOfLevel} />
            <DonationModal />
            <Content />
        </Layout >
    </>
}
