// Violation: import-x/no-default-export (uses default export — see bottom)
import { useState, type ReactNode } from 'react';

// ─── JavaScript: core violations ────────────────────────────────────────────

// Violation: no-var (use const/let instead)
var badVariable = 'hello';

// Violation: no-eval (dynamic code execution) — also in browser.js as error
const result = eval('1 + 2');

// Violation: no-nested-ternary
const nested = result ? 'a' : badVariable ? 'b' : 'c';

// Violation: object-shorthand (should use shorthand property)
const name = 'test';
const obj = { name: name };

// Violation: prefer-template (should use template literal)
const greeting = 'Hello, ' + name + '!';

// Violation: unicorn/prefer-native-coercion-functions (use String directly)
const stringify = (value: unknown) => String(value);

// ─── TypeScript: violations ─────────────────────────────────────────────────

// Violation: @typescript-eslint/naming-convention (interface must be PascalCase)
interface badProps {
    // Violation: react/boolean-prop-naming (boolean props should not use `is` prefix)
    isVisible: boolean;
    onClick: () => void;
}

// Violation: @typescript-eslint/no-explicit-any
const processAny = (data: any): string => data;

// ─── React: violations ──────────────────────────────────────────────────────

// Violation: react/function-component-definition (must use arrow function)
function BadComponent(props: badProps) {
    // Violation: prefer-const (never reassigned)
    let count = 0;

    // Violation: no-console
    console.log(count);

    // Violation: eqeqeq (use === instead of ==)
    if (count == 0) {
        return null;
    }

    // Violation: react/self-closing-comp (empty div should self-close)
    // Violation: react/button-has-type (button missing type attribute)
    return (
        <div>
            <div className="empty"></div>
            <button onClick={props.onClick}>Click</button>
        </div>
    );
}

// ─── Browser: violations ────────────────────────────────────────────────────

// Violation: no-script-url (javascript: protocol in URLs)
const badUrl = 'javascript:void(0)';

// ─── Quality (sonarjs): violations ──────────────────────────────────────────

// Violation: sonarjs/no-collapsible-if (nested if should be merged)
// Violation: @37bytes/boolean-naming (boolean param without prefix)
const checkPermissions = (role: string, active: boolean) => {
    if (role === 'admin') {
        if (active) {
            return true;
        }
    }
    return false;
};

// Violation: sonarjs/prefer-single-boolean-return (should return expression directly)
const isEmpty = (value: string) => {
    if (value.length === 0) {
        return true;
    }
    return false;
};

// ─── Regexp: violations ─────────────────────────────────────────────────────

// Violation: regexp/prefer-d (use \d instead of [0-9])
const DIGIT_REGEX = /^[0-9]+$/;

// Violation: regexp/no-useless-escape (unnecessary escape in character class)
const ESCAPED_REGEX = /^[\w\.]+$/;

// Use variables to avoid unused warnings
const _used = {
    badVariable,
    result,
    nested,
    obj,
    greeting,
    stringify,
    processAny,
    badUrl,
    checkPermissions,
    isEmpty,
    DIGIT_REGEX,
    ESCAPED_REGEX
};

// Violation: import-x/no-default-export
export default BadComponent;

export { _used };
