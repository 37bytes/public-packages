/**
 * @fileoverview Tests for no-arrow-props rule
 */

import { test } from 'node:test';

import { RuleTester } from 'eslint';

import { rule } from '../rule.js';

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true
            }
        }
    }
});

test('no-arrow-props: valid code', () => {
    tester.run('no-arrow-props', rule, {
        valid: [
            // Named function reference
            '<Button onClick={handleClick} />',
            // String prop
            '<Button label="Click me" />',
            // Variable reference
            '<Button disabled={isDisabled} />',
            // Object prop
            '<Button style={{ color: "red" }} />',
            // No value
            '<Button disabled />',
            // Number prop
            '<Button tabIndex={0} />',
            // Template literal prop
            // eslint-disable-next-line no-template-curly-in-string
            '<Button className={`btn-${variant}`} />',
            // Ternary expression (not an arrow)
            '<Button onClick={isActive ? handleA : handleB} />',
            // Spread props (no JSXAttribute, should not trigger)
            '<Button {...props} />',
            // Boolean expression
            '<Button visible={a && b} />',
            // Call expression (not arrow-based IIFE)
            '<Button onClick={handleClick(id)} />'
        ],
        invalid: []
    });
});

test('no-arrow-props: catches arrow functions in props', () => {
    tester.run('no-arrow-props', rule, {
        valid: [],
        invalid: [
            {
                code: '<Button onClick={() => doSomething()} />',
                errors: [{ messageId: 'noArrowProps', line: 1, column: 9 }]
            },
            {
                code: '<Button onClick={(e) => handleClick(e)} />',
                errors: [{ messageId: 'noArrowProps', line: 1, column: 9 }]
            },
            {
                code: '<Input onChange={(e) => setValue(e.target.value)} />',
                errors: [{ messageId: 'noArrowProps', line: 1, column: 8 }]
            }
        ]
    });
});

test('no-arrow-props: catches IIFE wrapping arrow function', () => {
    tester.run('no-arrow-props', rule, {
        valid: [],
        invalid: [
            {
                code: '<Button onClick={((e) => handleClick(e))("test")} />',
                errors: [{ messageId: 'noArrowProps', line: 1, column: 9 }]
            }
        ]
    });
});

test('no-arrow-props: multiple arrow props in one component', () => {
    tester.run('no-arrow-props', rule, {
        valid: [],
        invalid: [
            {
                code: '<Button onClick={() => a()} onMouseEnter={() => b()} />',
                errors: [{ messageId: 'noArrowProps' }, { messageId: 'noArrowProps' }]
            }
        ]
    });
});

test('no-arrow-props: nested JSX with arrows', () => {
    tester.run('no-arrow-props', rule, {
        valid: [],
        invalid: [
            {
                code: '<div><Button onClick={() => a()} /></div>',
                errors: [{ messageId: 'noArrowProps' }]
            }
        ]
    });
});

test('no-arrow-props: arrow returning JSX (common pattern)', () => {
    tester.run('no-arrow-props', rule, {
        valid: [],
        invalid: [
            {
                code: '<Button onClick={() => <Modal />} />',
                errors: [{ messageId: 'noArrowProps' }]
            }
        ]
    });
});

test('no-arrow-props: allowInRefs option', () => {
    tester.run('no-arrow-props', rule, {
        valid: [
            {
                code: '<div ref={(el) => setElement(el)} />',
                options: [{ allowInRefs: true }]
            },
            // *Ref suffix
            {
                code: '<div buttonRef={(el) => setButtonEl(el)} />',
                options: [{ allowInRefs: true }]
            },
            {
                code: '<div inputRef={(el) => setInput(el)} />',
                options: [{ allowInRefs: true }]
            }
        ],
        invalid: [
            // Explicit false
            {
                code: '<div ref={(el) => setElement(el)} />',
                options: [{ allowInRefs: false }],
                errors: [{ messageId: 'noArrowProps' }]
            },
            // Default: allowInRefs is false
            {
                code: '<div ref={(el) => setElement(el)} />',
                errors: [{ messageId: 'noArrowProps' }]
            },
            // Non-ref prop still triggers when allowInRefs is true
            {
                code: '<div ref={(el) => setElement(el)} onClick={() => handle()} />',
                options: [{ allowInRefs: true }],
                errors: [{ messageId: 'noArrowProps' }]
            }
        ]
    });
});

test('no-arrow-props: allowInRender option', () => {
    tester.run('no-arrow-props', rule, {
        valid: [
            {
                code: '<List render={(item) => <Item item={item} />} />',
                options: [{ allowInRender: true }]
            },
            {
                code: '<Table renderRow={(row) => <Row data={row} />} />',
                options: [{ allowInRender: true }]
            },
            {
                code: '<Field renderInput={(props) => <Input {...props} />} />',
                options: [{ allowInRender: true }]
            }
        ],
        invalid: [
            // Explicit false
            {
                code: '<List render={(item) => <Item item={item} />} />',
                options: [{ allowInRender: false }],
                errors: [{ messageId: 'noArrowProps' }]
            },
            // Default: allowInRender is false
            {
                code: '<List render={(item) => <Item />} />',
                errors: [{ messageId: 'noArrowProps' }]
            },
            // Non-render prop still triggers when allowInRender is true
            {
                code: '<List renderItems={(items) => <Items />} onClick={() => handle()} />',
                options: [{ allowInRender: true }],
                errors: [{ messageId: 'noArrowProps' }]
            }
        ]
    });
});

test('no-arrow-props: combined options', () => {
    tester.run('no-arrow-props', rule, {
        valid: [
            // Both refs and render props allowed simultaneously
            {
                code: '<Form ref={(el) => setForm(el)} render={(fields) => <Fields data={fields} />} />',
                options: [{ allowInRefs: true, allowInRender: true }]
            }
        ],
        invalid: [
            // Even with refs+render allowed, regular event handlers still trigger
            {
                code: '<Form ref={(el) => setForm(el)} onClick={() => submit()} />',
                options: [{ allowInRefs: true, allowInRender: true }],
                errors: [{ messageId: 'noArrowProps' }]
            }
        ]
    });
});

// --- allowComponents ---

test('no-arrow-props: allowComponents — exact match', () => {
    tester.run('no-arrow-props', rule, {
        valid: [
            {
                code: '<Controller render={(field) => <Input {...field} />} />',
                options: [{ allowComponents: ['Controller'] }]
            },
            {
                code: '<Controller onChange={() => update()} />',
                options: [{ allowComponents: ['Controller'] }]
            }
        ],
        invalid: [
            // Not in allowComponents list
            {
                code: '<Button onClick={() => handle()} />',
                options: [{ allowComponents: ['Controller'] }],
                errors: [{ messageId: 'noArrowProps' }]
            }
        ]
    });
});

test('no-arrow-props: allowComponents — wildcard pattern', () => {
    tester.run('no-arrow-props', rule, {
        valid: [
            {
                code: '<motion.div onAnimationComplete={() => done()} />',
                options: [{ allowComponents: ['motion.*'] }]
            },
            {
                code: '<motion.span onClick={() => handle()} />',
                options: [{ allowComponents: ['motion.*'] }]
            },
            {
                code: '<Select.Option onChange={() => pick()} />',
                options: [{ allowComponents: ['Select.*'] }]
            }
        ],
        invalid: [
            // "motion" alone does not match "motion.*"
            {
                code: '<motion onClick={() => handle()} />',
                options: [{ allowComponents: ['motion.*'] }],
                errors: [{ messageId: 'noArrowProps' }]
            },
            // Different namespace
            {
                code: '<Other.Item onClick={() => handle()} />',
                options: [{ allowComponents: ['motion.*'] }],
                errors: [{ messageId: 'noArrowProps' }]
            }
        ]
    });
});

test('no-arrow-props: allowComponents — multiple patterns', () => {
    tester.run('no-arrow-props', rule, {
        valid: [
            {
                code: '<motion.div onComplete={() => done()} />',
                options: [{ allowComponents: ['motion.*', 'Controller', 'Select.*'] }]
            },
            {
                code: '<Controller render={(f) => <Input {...f} />} />',
                options: [{ allowComponents: ['motion.*', 'Controller'] }]
            },
            {
                code: '<Select.Option onChange={() => pick()} />',
                options: [{ allowComponents: ['motion.*', 'Select.*'] }]
            }
        ],
        invalid: [
            {
                code: '<Button onClick={() => handle()} />',
                options: [{ allowComponents: ['motion.*', 'Controller'] }],
                errors: [{ messageId: 'noArrowProps' }]
            }
        ]
    });
});

test('no-arrow-props: allowComponents combined with other options', () => {
    tester.run('no-arrow-props', rule, {
        valid: [
            // allowComponents + allowInRefs together
            {
                code: '<motion.div ref={(el) => setEl(el)} onComplete={() => done()} />',
                options: [{ allowInRefs: true, allowComponents: ['motion.*'] }]
            }
        ],
        invalid: [
            // Component not in list — both props trigger
            {
                code: '<Button ref={(el) => setEl(el)} onClick={() => handle()} />',
                options: [{ allowComponents: ['motion.*'] }],
                errors: [{ messageId: 'noArrowProps' }, { messageId: 'noArrowProps' }]
            }
        ]
    });
});
