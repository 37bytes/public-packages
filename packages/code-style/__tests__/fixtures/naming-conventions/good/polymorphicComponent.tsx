/**
 * Polymorphic component pattern: `Element` is a PascalCase prop that holds
 * an element type (string tag or React component). Both the type definition
 * and the destructured FC parameter must accept PascalCase identifiers.
 *
 * This fixture exercises:
 *   - typeProperty selector (interface field `Element`)
 *   - parameter + destructured modifier (FC param `{ Element = 'div' }`)
 *
 * Note: rename-style destructure (`{ as: Element }`) is a different AST case —
 * `Element` becomes a regular `parameter` binding, not a destructured one. For
 * that pattern the local binding should stay camelCase (e.g. `as: elementTag`)
 * unless the rule is loosened further, which we intentionally avoid.
 */

import type { ElementType, ReactNode } from 'react';

interface BoxProps {
    Element?: ElementType;
    children: ReactNode;
}

export const Box = ({ Element = 'div', children }: BoxProps) => <Element>{children}</Element>;
