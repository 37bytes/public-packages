interface ChildRect {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

const PROTECTOR_ATTRIBUTE = 'data-pattern-protector';
const PROTECTOR_ENABLED_VALUE = 'true';
const PROTECTOR_SELECTOR = `[${PROTECTOR_ATTRIBUTE}=${PROTECTOR_ENABLED_VALUE}]`;

const PROTECTOR_PADDING = 'data-pattern-protector-padding';
const PROTECTOR_PADDING_LEFT = 'data-pattern-protector-padding-left';
const PROTECTOR_PADDING_RIGHT = 'data-pattern-protector-padding-right';
const PROTECTOR_PADDING_TOP = 'data-pattern-protector-padding-top';
const PROTECTOR_PADDING_BOTTOM = 'data-pattern-protector-padding-bottom';

const getPaddingValue = (element: Element, attribute: string): number | undefined => {
    const value = element.getAttribute(attribute);
    return value !== null ? parseInt(value) : undefined;
};

interface GetChildrenRectsParams {
    container: HTMLElement;
    hideDistance: number;
}

const getChildrenRects = ({ container, hideDistance }: GetChildrenRectsParams): ChildRect[] => {
    const containerRect = container.getBoundingClientRect();

    return Array.from(container.querySelectorAll(PROTECTOR_SELECTOR)).map((child) => {
        const rect = child.getBoundingClientRect();

        const padding = getPaddingValue(child, PROTECTOR_PADDING) ?? hideDistance;
        const paddingLeft = getPaddingValue(child, PROTECTOR_PADDING_LEFT) ?? padding;
        const paddingTop = getPaddingValue(child, PROTECTOR_PADDING_TOP) ?? padding;
        const paddingRight = getPaddingValue(child, PROTECTOR_PADDING_RIGHT) ?? padding;
        const paddingBottom = getPaddingValue(child, PROTECTOR_PADDING_BOTTOM) ?? padding;

        return {
            left: rect.left - containerRect.left - paddingLeft,
            top: rect.top - containerRect.top - paddingTop,
            right: rect.right - containerRect.left + paddingRight,
            bottom: rect.bottom - containerRect.top + paddingBottom
        };
    });
};

export { getChildrenRects };
