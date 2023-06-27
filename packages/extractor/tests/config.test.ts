import CSSExtractor from '../src'
import fs from 'fs'
import path from 'path'

test('read master.css.js config in cwd', async () => {
    const extractor = new CSSExtractor({ cwd: __dirname })
    expect(extractor.css.config)
        .toBeDefined()
})

test('master.css.js config custom classname', async () => {
    fs.writeFileSync(path.join(__dirname, 'master.css.ts'), `
        export default {
            classes: {
                'blue-btn': 'bg:blue',
                btn: 'bg:gray'
            }
        }
    `, { flag: 'w' })
    const extractor = new CSSExtractor({ cwd: __dirname })
    expect(
        extractor.extract('test.tsx',
            `
            <h1 className={'rel ' + styles.title}>
            <h1 className="{styles.title + ' ' + 'blue-btn'}">
            <button className="test btn">
        `)
    ).toEqual(['rel', 'blue-btn', 'test', 'btn'])
})
