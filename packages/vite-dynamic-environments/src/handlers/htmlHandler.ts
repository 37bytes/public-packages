export const handleTransformIndexHtml = ({ html, scriptLink }) => {
    if (!html.includes('<head>')) {
        throw new Error("dynamicEnvironmentsPlugin: '<head>' not found in html");
    }

    return html.replace('<head>', `<head><script src='${scriptLink}'></script>`);
};
