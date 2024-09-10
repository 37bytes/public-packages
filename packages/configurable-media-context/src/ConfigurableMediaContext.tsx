import debounce from 'lodash.debounce';
import {
    createContext,
    FunctionComponent,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useState
} from 'react';

export type MediaQueriesMap<T extends number = number> = Record<T, MediaQueryList>;

export interface ConfigurableMediaContextValue<T extends number = number> {
    media: T[];
}

export const ConfigurableMediaContext = createContext<ConfigurableMediaContextValue | null>(null);

interface Props extends PropsWithChildren {
    mediaQueriesMap: MediaQueriesMap;
}

export const ConfigurableMediaContextProvider: FunctionComponent<Props> = ({ mediaQueriesMap, children }) => {
    const getMedia = useCallback(
        (): number[] =>
            Object.keys(mediaQueriesMap)
                .filter((media) => {
                    const item = mediaQueriesMap[Number(media)] as MediaQueriesMap[number];

                    return item.matches;
                })
                .map((item) => Number(item)),
        [mediaQueriesMap]
    );

    const [contextState, setContextState] = useState<ConfigurableMediaContextValue>(() => ({ media: getMedia() }));

    useEffect(() => {
        const handler = debounce(() => setContextState({ media: getMedia() }), 250);

        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [getMedia]);

    return <ConfigurableMediaContext.Provider value={contextState}>{children}</ConfigurableMediaContext.Provider>;
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
