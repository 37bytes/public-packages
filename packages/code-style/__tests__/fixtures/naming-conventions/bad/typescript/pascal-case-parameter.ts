/**
 * PascalCase for plain parameters (not in the polymorphic-component whitelist
 * `Element|Component|Tag`) must remain a violation. This guards against
 * accidentally widening the `parameter` selector when relaxing it for the
 * polymorphic case.
 */

export const handle = (SomeArg: string): string => SomeArg.toUpperCase();
