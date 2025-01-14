const functions = {
    $: {
        transform(opening, value, closing) {
            const foundValue = this.css.variables[value]
            return foundValue
                ? foundValue
                : 'var(--' + value + ')'
        }
    },
    calc: {
        transform(opening, value, closing) {
            const variables = this.variables
            const functions = this.css.config.functions

            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const instance = this
            let i = 0, newValue = '', current = '';
            (function anaylze(functionName: string, bypassHandlingUnitForcely: boolean) {
                let bypassHandlingUnit = false
                const clear = (char: string, addPrefixSpace = false, addSuffixSpace = false) => {
                    if (char !== '(') {
                        if (variables && current in variables) {
                            current = variables[current].toString()
                        }
                    }

                    if (current && !bypassHandlingUnit && !bypassHandlingUnitForcely) {
                        const result = instance.resolveUnitValue(current, functions.calc.unit)
                        if (result) {
                            current = result.value + result.unit
                        }
                    }

                    newValue += current
                        + ((addPrefixSpace && value[i - 1] !== ' ') ? ' ' : '')
                        + char
                        + ((addSuffixSpace && value[i + 1] !== ' ') ? ' ' : '')

                    current = ''
                    bypassHandlingUnit = false
                }

                for (; i < value.length; i++) {
                    const char = value[i]
                    if (char === '(') {
                        const isStartsWithSymbol = /^[+-]/.test(current)
                        const newFunctionName = isStartsWithSymbol ? current.slice(1) : current
                        const originalBypassHandlingUnit = bypassHandlingUnit
                        const originalNewValueLength = newValue.length
                        clear(char)
                        i++
                        anaylze(newFunctionName, originalBypassHandlingUnit || bypassHandlingUnitForcely)

                        if (newFunctionName !== 'calc') {
                            const functionConfig = functions[newFunctionName]
                            if (functionConfig) {
                                const functionValue = newValue.slice(originalNewValueLength + 2 + (isStartsWithSymbol ? 1 : 0), newValue.length - 1)
                                newValue = newValue.slice(0, originalNewValueLength - newFunctionName.length + 1 + (isStartsWithSymbol ? 1 : 0))
                                if (functionConfig.transform) {
                                    const transformedValue = functionConfig.transform.call(instance, '(', functionValue, ')')
                                    const result = instance.resolveUnitValue(transformedValue, functions.calc.unit)
                                    newValue += result
                                        ? result.value + result.unit
                                        : transformedValue
                                } else {
                                    newValue += (functionConfig.name ?? newFunctionName) + '(' + functionValue + ')'
                                }
                            }
                        }
                    } else if (char === ')') {
                        clear(char)
                        break
                    } else if (char === ',') {
                        clear(char, false, true)
                    } else if (char === ' ') {
                        clear(char)
                    } else {
                        const previousChar = value[i - 1]
                        switch (char) {
                            case '+':
                                if (!current && previousChar !== ')') {
                                    current += char
                                } else {
                                    clear(char, true, true)
                                }
                                break
                            case '-':
                                if (functionName === 'var' || !current && previousChar !== ')') {
                                    current += char
                                } else {
                                    clear(char, true, true)
                                }
                                break
                            case '*':
                                clear(char, true, true)
                                break
                            case '/':
                                clear(char, true, true)
                                bypassHandlingUnit = true
                                break
                            default:
                                current += char
                                break
                        }
                    }
                }

                if (i >= value.length - 1) {
                    clear('')
                }
            })('', false)

            return opening + newValue + closing
        }
    },
    translate: { unit: 'rem' },
    translateX: { unit: 'rem' },
    translateY: { unit: 'rem' },
    translateZ: { unit: 'rem' },
    translate3d: { unit: 'rem' },
    skew: { unit: 'deg' },
    skewX: { unit: 'deg' },
    skewY: { unit: 'deg' },
    skewZ: { unit: 'deg' },
    skew3d: { unit: 'deg' },
    rotate: { unit: 'deg' },
    rotateX: { unit: 'deg' },
    rotateY: { unit: 'deg' },
    rotateZ: { unit: 'deg' },
    rotate3d: { unit: 'deg' },
    blur: { unit: 'rem' },
    'drop-shadow': { unit: 'rem' },
    'hue-rotate': { unit: 'deg' },
    rgb: { unit: '' },
    rgba: { unit: '' },
    hsl: { unit: '' },
    hsla: { unit: '' },
    color: { unit: '', colored: true },
    'color-contrast': { unit: '', colored: true },
    'color-mix': { unit: '', colored: true },
    hwb: { unit: '' },
    lab: { unit: '' },
    lch: { unit: '' },
    oklab: { unit: '' },
    oklch: { unit: '' },
    clamp: { unit: '' },
    repeat: { unit: '' },
    'linear-gradient': { colored: true },
    'radial-gradient': { colored: true },
    'conic-gradient': { colored: true },
    'repeating-linear-gradient': { colored: true },
    'repeating-radial-gradient': { colored: true },
    'repeating-conic-gradient': { colored: true }
}

export default functions