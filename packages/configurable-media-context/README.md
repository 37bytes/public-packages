# @37bytes/configurable-media-context

A lightweight React context provider for managing media queries, allowing dynamic updates based on screen size. This package provides a way to reactively track which media queries are active at any given time.

## Installation

To install the package, run the following command:

```shell
npm install @37bytes/configurable-media-context
```

## Usage

```tsx
import { createMediaContextProvider, MediaQueriesMap } from 'configurable-media-context';

export enum Media {
    MOBILE = 480,
    TABLET = 768,
    MEDIUM_DESKTOP = 1024,
    LARGE_DESKTOP = 1280
}

const mediaQueriesMap: MediaQueriesMap<Media> = {
    [Media.MOBILE]: window.matchMedia(`(max-width: ${Media.MOBILE}px)`),
    [Media.TABLET]: window.matchMedia(`(min-width: ${Media.TABLET}px)`),
    [Media.MEDIUM_DESKTOP]: window.matchMedia(`(min-width: ${Media.MEDIUM_DESKTOP}px)`),
    [Media.LARGE_DESKTOP]: window.matchMedia(`(min-width: ${Media.LARGE_DESKTOP}px)`)
};
const {MediaContextProvider, useMediaContext: usePureMediaContext} = createMediaContextProvider(mediaQueriesMap);

// ...

const getBreakpoint = (media: Media[]): Media => {
    switch (true) {
        case media.includes(Media.LARGE_DESKTOP):
            return Media.LARGE_DESKTOP;
        case media.includes(Media.MEDIUM_DESKTOP):
            return Media.MEDIUM_DESKTOP;
        case media.includes(Media.TABLET):
            return Media.TABLET;
        default:
            return Media.MOBILE;
    }
};

const useMediaContext = () => {
    const {media} = usePureMediaContext();

    const breakpoint = getBreakpoint(media);

    const isMobile = breakpoint === Media.MOBILE;
    const isTablet = breakpoint === Media.TABLET;
    const isMediumDesktop = breakpoint === Media.MEDIUM_DESKTOP;
    const isLargeDesktop = breakpoint === Media.LARGE_DESKTOP;

    const isHandheld = isMobile || isTablet;
    const isDesktop = isMediumDesktop || isLargeDesktop;

    return {
        media,
        breakpoint,

        isMobile,
        isTablet,
        isMediumDesktop,
        isLargeDesktop,

        isHandheld,
        isDesktop
    };
};

// ..

const App = () => (
    <MediaContextProvider>
        <YourComponent/>
    </MediaContextProvider>
);
```

# Changelog
## 2.0.0
- lodash.debounce => throttle from [es-toolkit](https://es-toolkit.slash.page/)
- 250ms delay => 100ms delay
- resizeThrottleDelay for custom delay
- resizeThrottleDelay with 0 disabling delay
