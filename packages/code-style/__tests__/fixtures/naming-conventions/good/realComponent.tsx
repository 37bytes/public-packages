import { type FunctionComponent, useState, useEffect, useRef } from 'react';

interface Props {
    children: string;
}

const PatternProtectedText: FunctionComponent<Props> = ({ children }) => {
    const [lines, setLines] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateLines = () => {
            const wrapper = wrapperRef.current;
            if (!wrapper) {
                return;
            }

            const words = children.split(' ');
            const tempLines: string[] = [];
            let currentLine = '';

            const testSpan = document.createElement('span');
            document.body.appendChild(testSpan);
            testSpan.style.visibility = 'hidden';
            testSpan.style.whiteSpace = 'nowrap';

            words.forEach((word) => {
                const newLine = currentLine ? `${currentLine} ${word}` : word;
                testSpan.innerText = newLine;

                if (testSpan.offsetWidth <= wrapper.clientWidth) {
                    currentLine = newLine;
                } else {
                    tempLines.push(currentLine);
                    currentLine = word;
                }
            });

            tempLines.push(currentLine);
            document.body.removeChild(testSpan);
            setLines(tempLines);
        };

        updateLines();

        const resizeObserver = new ResizeObserver(updateLines);
        const mutationObserver = new MutationObserver(updateLines);

        const wrapper = wrapperRef.current;
        if (wrapper) {
            resizeObserver.observe(wrapper);
            mutationObserver.observe(wrapper, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [children]);

    return (
        <div ref={wrapperRef} style={{ width: '100%' }}>
            {lines.map((line, index) => (
                <div key={index} style={{ width: 'fit-content' }}>
                    {line}
                </div>
            ))}
        </div>
    );
};

export { PatternProtectedText };
