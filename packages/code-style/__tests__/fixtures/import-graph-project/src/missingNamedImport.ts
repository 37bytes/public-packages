import { notExported } from './alpha';

export const useMissing = (): unknown => notExported;
