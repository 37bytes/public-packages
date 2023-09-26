const environmentTitleWatcher = (standName: string) => {
    const target = document.querySelector('title') as Node;

    const observer = new MutationObserver(function () {
        const currentPageTitle = document.title;

        if (!currentPageTitle.startsWith(`[${standName}]`)) {
            document.title = `[${standName}] | ${currentPageTitle}`;
        }
    });

    const config = { subtree: true, characterData: true, childList: true };
    observer.observe(target, config);
};

export default environmentTitleWatcher;
