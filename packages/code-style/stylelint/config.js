/**
 * @fileoverview Stylelint configuration for CSS/SCSS modules
 * @author 37bytes
 *
 * Enforces property ordering, CSS variable usage for colors/z-index/fonts,
 * lowerCamelCase class selectors (CSS Modules), and no type selectors.
 *
 * Based on stylelint-config-standard-scss with custom overrides.
 */

/** @type {import('stylelint').Config} */
export const config = {
    defaultSeverity: 'warning',
    extends: ['stylelint-config-standard-scss'],
    plugins: ['stylelint-order', 'stylelint-declaration-strict-value'],
    rules: {
        // Disallow type selectors (enforce class-only selectors for CSS Modules)
        'selector-max-type': 0,

        // Duplicate detection
        'declaration-block-no-duplicate-properties': true,
        'no-duplicate-selectors': true,

        // Empty blocks
        'block-no-empty': true,
        'comment-no-empty': true,

        // Unit restrictions
        'declaration-property-unit-allowed-list': {
            'font-size': ['px']
        },

        // Disable empty line before declarations (conflicts with property ordering)
        'declaration-empty-line-before': null,

        // Enforce lowerCamelCase for class selectors (CSS Modules)
        'selector-class-pattern': [
            '^[a-z][a-zA-Z0-9]*$',
            {
                message: 'Expected class selector to be lowerCamelCase',
                severity: 'error'
            }
        ],

        // Enforce CSS variables for colors, z-index, font-family
        'scale-unlimited/declaration-strict-value': [
            ['/color$/', 'z-index', 'font-family'],
            { expandShorthand: true, disableFix: true }
        ],

        // Property ordering: custom properties first, then declarations
        'order/order': ['custom-properties', 'declarations'],

        // Logical property groups with empty lines between them
        'order/properties-order': [
            [
                {
                    properties: ['all']
                },
                {
                    emptyLineBefore: 'always',
                    properties: ['content']
                },
                {
                    emptyLineBefore: 'always',
                    properties: ['position', 'inset', 'top', 'right', 'bottom', 'left', 'z-index']
                },
                {
                    emptyLineBefore: 'always',
                    properties: [
                        'display',
                        'vertical-align',
                        'flex',
                        'flex-grow',
                        'flex-shrink',
                        'flex-basis',
                        'flex-direction',
                        'flex-flow',
                        'flex-wrap',
                        'grid',
                        'grid-area',
                        'grid-template',
                        'grid-template-areas',
                        'grid-template-rows',
                        'grid-template-columns',
                        'grid-row',
                        'grid-row-start',
                        'grid-row-end',
                        'grid-column',
                        'grid-column-start',
                        'grid-column-end',
                        'grid-auto-rows',
                        'grid-auto-columns',
                        'grid-auto-flow',
                        'grid-gap',
                        'grid-row-gap',
                        'grid-column-gap',
                        'gap',
                        'row-gap',
                        'column-gap',
                        'place-content',
                        'align-content',
                        'justify-content',
                        'place-items',
                        'align-items',
                        'justify-items',
                        'place-self',
                        'align-self',
                        'justify-self',
                        'order',
                        'float',
                        'clear',
                        'object-fit',
                        'object-position',
                        'overflow',
                        'overflow-x',
                        'overflow-y',
                        'overflow-scrolling'
                    ]
                },
                {
                    emptyLineBefore: 'always',
                    properties: [
                        'box-sizing',
                        'width',
                        'min-width',
                        'max-width',
                        'height',
                        'min-height',
                        'max-height',
                        'margin',
                        'margin-inline',
                        'margin-block',
                        'margin-top',
                        'margin-right',
                        'margin-bottom',
                        'margin-left',
                        'padding',
                        'padding-inline',
                        'padding-block',
                        'padding-top',
                        'padding-right',
                        'padding-bottom',
                        'padding-left'
                    ]
                },
                {
                    emptyLineBefore: 'always',
                    properties: [
                        'border',
                        'border-spacing',
                        'border-collapse',
                        'border-width',
                        'border-style',
                        'border-color',
                        'border-top',
                        'border-top-width',
                        'border-top-style',
                        'border-top-color',
                        'border-right',
                        'border-right-width',
                        'border-right-style',
                        'border-right-color',
                        'border-bottom',
                        'border-bottom-width',
                        'border-bottom-style',
                        'border-bottom-color',
                        'border-left',
                        'border-left-width',
                        'border-left-style',
                        'border-left-color',
                        'border-radius',
                        'border-top-left-radius',
                        'border-top-right-radius',
                        'border-bottom-right-radius',
                        'border-bottom-left-radius',
                        'border-image',
                        'border-image-source',
                        'border-image-slice',
                        'border-image-width',
                        'border-image-outset',
                        'border-image-repeat',
                        'border-top-image',
                        'border-right-image',
                        'border-bottom-image',
                        'border-left-image',
                        'border-corner-image',
                        'border-top-left-image',
                        'border-top-right-image',
                        'border-bottom-right-image',
                        'border-bottom-left-image'
                    ]
                },
                {
                    emptyLineBefore: 'always',
                    properties: [
                        'background',
                        'background-color',
                        'background-image',
                        'background-attachment',
                        'background-position',
                        'background-position-x',
                        'background-position-y',
                        'background-clip',
                        'background-origin',
                        'background-size',
                        'background-repeat'
                    ]
                },
                {
                    emptyLineBefore: 'always',
                    properties: [
                        'color',
                        'box-decoration-break',
                        'box-shadow',
                        'outline',
                        'outline-width',
                        'outline-style',
                        'outline-color',
                        'outline-offset'
                    ]
                }
            ]
        ]
    }
};

export default config;
