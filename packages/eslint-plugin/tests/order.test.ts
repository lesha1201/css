import rule from '../src/rules/class-order'
import { RuleTester } from 'eslint'

new RuleTester({
    parserOptions: {
        ecmaVersion: 2019,
        ecmaFeatures: {
            jsx: true,
        },
    }
}).run('class order', rule, {
    valid: [
        {
            code: `<div class="bg:black fg:white f:24 m:8 p:8">Simple, basic</div>`,
        },
        {
            code: `<div class="card mt:20">Traditional class + syntax</div>`,
        },
        {
            code: `<div test="bg:black fg:white f:24 m:8 p:8">Simple, using 'test' prop</div>`,
            settings: {
                '@master/css': {
                    classMatching: '^test|class(Name)?$',
                },
            },
        },
        {
            code: '<div className={ctl(`p:10 w:full ${live && \'bg:blue-10 bg:purple-40@dark r:5@sm\'}`)}>ctl + exp</div>',
        },
        {
            code: '<div className={ctl(`bg:blue-50 r:100% h:48 w:48 ${className}`)}>ctl + var</div>',
        },
        {
            code: '<div className={ctl(`p:10 w:full ${live && \'bg: white bg: black@dark\'}`)}>Space trim issue</div>',
        },
        {
            code: `
                    ctl(\`
                        flex align-items:center justify-content:center
                        \${ variant === SpinnerVariant.OVERLAY && \`rounded bg:gray-40 b:2 px:4 z:60 \${widthClass} \${heightClass}\`}
                        \${ variant === SpinnerVariant.FULLSCREEN &&
                        \`fixed bg:white@dark bottom:0 left:0 opacity:.6@dark px:4 right:0 top:0 z:60\`
                            }
                    \`)`,
        },
        {
            code: `<div class='bg:black fg:white f:24 m:8 p:8'>Simple quotes</div>`,
        },
        {
            code: `<div class="p:8 ">Extra space at the end</div>`,
        },
        {
            code: `<div test="p:8 ">Extra space at the end, but with 'tw' prop</div>`,
            settings: {
                '@master/css': {
                    classMatching: '^test|class(Name)?$',
                },
            },
        },
        {
            code: `<div class="p:5 p:4@lg px:6 px:3@sm py:2@md">'p', then 'py' then 'px'</div>`,
        },
        {
            code: `ctl(\`
                        container
                        flex
                        w:12
                        w:6@sm
                        w:4@lg
                    \`)`,
        },
        {
            code: `<div class="w:12 w:500px@lg">Allowed arbitrary value</div>`,
        },
        {
            code: `<div class="bg:black:focus:hover@dark bg:gray-40:disabled:focus:hover@md@dark">Stackable variants</div>`,
        },
        {
            code: `<div className={clsx(\`abs flex bottom:0 flex:col h:270px w:full\`)}>clsx</div>`,
            options: [
                {
                    callees: ['clsx'],
                },
            ],
        },
        {
            code: `<div class="zDialog flex w:12">Number values</div>`,
            settings: {
                '@master/css': {
                    config: {
                        styles: { zDialog: 'z:10000' }
                    }
                }
            }
        },
        {
            code: `<div class="   flex  m:10   ">Extra spaces</div>`,
        },
        {
            code: `
      <div className={\`rel overflow:hidden w:full \${yolo ? 'flex flex:col' : 'block'}\`}>Issue #131</div>
      `,
        },
        {
            code: `<div class>No errors while typing</div>`,
        },
        {
            code: `<div class="block my:1\u3000flex">Do not treat full width space as class separator</div>`,
        },
        {
            code: `<div class="m:10 m:20 m:30:hover m:40@dark">Collision class</div>`,
        },

    ],
    invalid: [
        {
            code: `<div class="fg:white f:24 m:8 p:8 bg:black">Classnames will be ordered</div>`,
            output: `<div class="bg:black fg:white f:24 m:8 p:8">Classnames will be ordered</div>`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `<div class="flex uppercase m:0 m:0>li text-decoration:none>li>a px:4>li align-items:baseline fg:gray-30>li>a gap-x:28 font:12 font:semibold pb:6>li pt:20 pt:10>li {bb:3|solid|black}>li:has(>.router-link-active) {fg:black}>li:has(>.router-link-active)>a fg:gray-10>li>a:hover box-shadow:none>li>a:focus">Group</div>`,
            output: `<div class="flex uppercase align-items:baseline box-shadow:none>li>a:focus fg:gray-30>li>a fg:gray-10>li>a:hover gap-x:28 font:12 font:semibold {bb:3|solid|black}>li:has(>.router-link-active) {fg:black}>li:has(>.router-link-active)>a m:0 m:0>li pb:6>li pt:20 pt:10>li px:4>li text-decoration:none>li>a">Group</div>`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `<div test="p:4 px:7@sm p:8@lg py:5@sm">Enhancing readability with 'test' prop</div>`,
            output: `<div test="p:4 p:8@lg px:7@sm py:5@sm">Enhancing readability with 'test' prop</div>`,
            settings: {
                '@master/css': {
                    classMatching: '^test|class(Name)?$',
                },
            },
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `<div class="grid grid-cols:1 grid-cols:2@sm px:8@sm py:12@sm gap:8 py:16@md">:)...</div>`,
            output: `<div class="grid gap:8 grid-cols:1 grid-cols:2@sm px:8@sm py:12@sm py:16@md">:)...</div>`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: 'ctl(`p:10 flex ${some}`)',
            output: 'ctl(`flex p:10 ${some}`)',
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: '<div className={ctl(`p:10 flex ${live && \'bg:black@dark bg:white\'}`)}>Space trim issue with fix</div>',
            output: '<div className={ctl(`flex p:10 ${live && \'bg:white bg:black@dark\'}`)}>Space trim issue with fix</div>',
            errors: [
                { messageId: 'invalidClassOrder' },
                { messageId: 'invalidClassOrder' }
            ],
        },
        {
            code: `<div class='bg:black@dark bg:white'>Simple quotes</div>`,
            output: `<div class='bg:white bg:black@dark'>Simple quotes</div>`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            options: [
                {
                    removeDuplicates: false,
                },
            ],
            code: `<div class="w:12 w:6@lg w:12">removeDuplicates</div>`,
            output: `<div class="w:12 w:6@lg">removeDuplicates</div>`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `<div class="w:12  w:6@lg  w:12">Single line dups + no head/tail spaces</div>`,
            output: `<div class="w:12  w:6@lg">Single line dups + no head/tail spaces</div>`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `<div class=" w:12  w:6@lg   w:12">Single dups line + head spaces</div>`,
            output: `<div class=" w:12  w:6@lg">Single dups line + head spaces</div>`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `<div class="w:12  w:6@lg   w:12 ">Single line dups + tail spaces</div>`,
            output: `<div class="w:12  w:6@lg   ">Single line dups + tail spaces</div>`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            // Multiline + both head/tail spaces
            code: `
      ctl(\`
        hide
        w:6@sm
        block
        hide
        flex
        block
        w:12
        flex
        block
        w:4@lg
        w:4@lg
      \`);`,
            output: `
      ctl(\`
        block
        flex
        hide
        w:12
        w:6@sm
        w:4@lg
      \`);`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `
      ctl(\`
        invalid
        w:6@sm
        container
        w:12
        flex
        w:4@lg
      \`);`,
            output: `
      ctl(\`
        invalid
        container
        flex
        w:12
        w:6@sm
        w:4@lg
      \`);`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `
      const buttonClasses = ctl(\`
        \${fullWidth ? "w:12" : "w:6"}
        container
        \${fullWidth ? "w:8@sm" : "w:4@sm"}
        w:9@lg
        flex
        \${hasError && "bg:red"}
      \`);`,
            output: `
      const buttonClasses = ctl(\`
        \${fullWidth ? "w:12" : "w:6"}
        container
        \${fullWidth ? "w:8@sm" : "w:4@sm"}
        flex
        w:9@lg
        \${hasError && "bg:red"}
      \`);`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `
      const buttonClasses = ctl(\`
        \${fullWidth ? "w:12" : "w:6"}
        flex
        container
        \${fullWidth ? "w:7@sm" : "w:4@sm"}
        py:4@lg
        py:6@sm
        \${hasError && "bg:red"}
      \`);`,
            output: `
      const buttonClasses = ctl(\`
        \${fullWidth ? "w:12" : "w:6"}
        container
        flex
        \${fullWidth ? "w:7@sm" : "w:4@sm"}
        py:6@sm
        py:4@lg
        \${hasError && "bg:red"}
      \`);`,
            errors: [{ messageId: 'invalidClassOrder' }, { messageId: 'invalidClassOrder' }],
        },
        {
            code: `<div class="w:12@sm w:320px">Allowed arbitrary value but incorrect order</div>`,
            output: `<div class="w:320px w:12@sm">Allowed arbitrary value but incorrect order</div>`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `clsx(\`abs bottom:0 w:full h:70px flex flex:col\`);`,
            output: `clsx(\`abs flex bottom:0 flex:col h:70px w:full\`);`,
            options: [
                {
                    callees: ['clsx'],
                },
            ],
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `cva({
          primary: ["abs bottom:0 w:full h:70px flex flex:col"],
        })`,
            output: `cva({
          primary: ["abs flex bottom:0 flex:col h:70px w:full"],
        })`,
            options: [
                {
                    callees: ['cva'],
                },
            ],
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `<div className={clsx(\`abs bottom:0 w:full h:270px flex flex:col\`)}>clsx</div>`,
            output: `<div className={clsx(\`abs flex bottom:0 flex:col h:270px w:full\`)}>clsx</div>`,
            options: [
                {
                    callees: ['clsx'],
                },
            ],
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `
      ctl(\`
        px:2
        flex
        \${
          !isDisabled &&
          \`
            top:0
            flex
            b:0
          \`
        }
        \${
          isDisabled &&
          \`
            mx:0
            b:0
          \`
        }
      \`)
      `,
            output: `
      ctl(\`
        flex
        px:2
        \${
          !isDisabled &&
          \`
            flex
            b:0
            top:0
          \`
        }
        \${
          isDisabled &&
          \`
            b:0
            mx:0
          \`
        }
      \`)
      `,
            errors: [
                { messageId: 'invalidClassOrder' },
                { messageId: 'invalidClassOrder' },
                { messageId: 'invalidClassOrder' }
            ],
        },
        {
            code: `<div className="px:2 flex">...</div>`,
            output: `<div className="flex px:2">...</div>`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `ctl(\`\${enabled && "px:2 flex"}\`)`,
            output: `ctl(\`\${enabled && "flex px:2"}\`)`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `ctl(\`px:2 flex\`)`,
            output: `ctl(\`flex px:2\`)`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `
      ctl(\`
        px:2
        flex
      \`)
      `,
            output: `
      ctl(\`
        flex
        px:2
      \`)
      `,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `
      <div
        className={clsx(
          "w:full h:10 rounded",
          name === "white"
            ? "m:10 flex"
            : undefined
        )}
      />
      `,
            output: `
      <div
        className={clsx(
          "rounded h:10 w:full",
          name === "white"
            ? "flex m:10"
            : undefined
        )}
      />
      `,
            errors: [{ messageId: 'invalidClassOrder' }, { messageId: 'invalidClassOrder' }],
        },
        {
            code: `
      classnames([
        'invalid w:4@lg w:6@sm',
        ['w:12 flex'],
      ])`,
            output: `
      classnames([
        'invalid w:6@sm w:4@lg',
        ['flex w:12'],
      ])`,
            errors: [{ messageId: 'invalidClassOrder' }, { messageId: 'invalidClassOrder' }],
        },
        {
            code: `
      classnames({
        invalid,
        flex: myFlag,
        'w:4@lg w:6@sm': resize
      })`,
            output: `
      classnames({
        invalid,
        flex: myFlag,
        'w:6@sm w:4@lg': resize
      })`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `ctl(\`\${some} container animate-spin first:flex \${bool ? "flex:col flex" : ""}\`)`,
            output: `ctl(\`\${some} container animate-spin first:flex \${bool ? "flex flex:col" : ""}\`)`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
        {
            code: `ctl(\`p:3 b:3|solid|gray m:4 h:24 p:4@lg flex b:2 m:4@lg\`)`,
            output: `ctl(\`flex b:3|solid|gray b:2 h:24 m:4 m:4@lg p:3 p:4@lg\`)`,
            errors: [{ messageId: 'invalidClassOrder' }],
        },
    ],
})