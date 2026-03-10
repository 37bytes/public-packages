import {
    createContext,
    type FunctionComponent,
    type PropsWithChildren,
    useCallback,
    useContext,
    useRef,
    useSyncExternalStore
} from 'react';

export type MediaQueriesMap<T extends number = number> = Record<T, MediaQueryList>;

export interface ConfigurableMediaContextValue<T extends number = number> {
    media: T[];
}

export const ConfigurableMediaContext = createContext<ConfigurableMediaContextValue | null>(null);

const getMedia = <T extends number>(mediaQueriesMap: MediaQueriesMap<T>): T[] =>
    (Object.keys(mediaQueriesMap) as unknown as T[]).filter((key) => mediaQueriesMap[key].matches);

const arraysEqual = (prev: number[], next: number[]): boolean => {
    if (prev.length !== next.length) {
        return false;
    }
    for (let index = 0; index < prev.length; index++) {
        if (prev[index] !== next[index]) {
            return false;
        }
    }
    return true;
};

interface Props extends PropsWithChildren {
    mediaQueriesMap: MediaQueriesMap;
}

export const ConfigurableMediaContextProvider: FunctionComponent<Props> = ({ mediaQueriesMap, children }) => {
    const cacheRef = useRef<null | number[]>(null);

    const subscribe = useCallback(
        (callback: () => void) => {
            const mediaQueryLists = Object.values(mediaQueriesMap) as MediaQueryList[];
            for (const mql of mediaQueryLists) {
                mql.addEventListener('change', callback);
            }
            return () => {
                for (const mql of mediaQueryLists) {
                    mql.removeEventListener('change', callback);
                }
            };
        },
        [mediaQueriesMap]
    );

    const getSnapshot = useCallback((): number[] => {
        const next = getMedia(mediaQueriesMap);
        if (cacheRef.current && arraysEqual(cacheRef.current, next)) {
            return cacheRef.current;
        }
        cacheRef.current = next;
        return next;
    }, [mediaQueriesMap]);

    const media = useSyncExternalStore(subscribe, getSnapshot);

    return <ConfigurableMediaContext.Provider value={{ media }}>{children}</ConfigurableMediaContext.Provider>;
};

export const useConfigurableMediaContext = (): ConfigurableMediaContextValue => {
    const mediaContextValue = useContext(ConfigurableMediaContext);
    if (!mediaContextValue) {
        throw new Error('useConfigurableMediaContext: ConfigurableMediaContext value is falsy');
    }

    return mediaContextValue;
};

export const createMediaContextProvider = <T extends number>(mediaQueriesMap: MediaQueriesMap<T>) => {
    const MediaContextProvider: FunctionComponent<PropsWithChildren> = ({ children }) => (
        <ConfigurableMediaContextProvider mediaQueriesMap={mediaQueriesMap}>
            {children}
        </ConfigurableMediaContextProvider>
    );

    return {
        MediaContextProvider,
        useMediaContext: useConfigurableMediaContext as () => ConfigurableMediaContextValue<T>
    };
};
