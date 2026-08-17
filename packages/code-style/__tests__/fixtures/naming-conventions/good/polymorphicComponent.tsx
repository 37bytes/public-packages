/**
 * Polymorphic component pattern: `Element` is a PascalCase prop that holds
 * an element type (string tag or React component).
 *
 * This fixture exercises:
 *   - typeProperty selector (interface field `Element`)
 *   - parameter + destructured modifier (FC param `{ Element = 'div' }`)
 *   - parameter with whitelisted name `Element|Component|Tag`
 *     (FC param `{ as: Element = 'div' }`, rename from a lowercase source prop)
 *
 * Other parameter names (e.g. `function handle(SomeArg)`) remain restricted
 * to camelCase. The whitelist is intentionally small.
 */

import type { ElementType, ReactNode } from 'react';

interface BoxProps {
    Element?: ElementType;
    children: ReactNode;
}

export const Box = ({ Element = 'div', children }: BoxProps) => <Element>{children}</Element>;

interface AsBoxProps {
    as?: ElementType;
    children: ReactNode;
}

export const AsBox = ({ as: Element = 'div', children }: AsBoxProps) => <Element>{children}</Element>;
