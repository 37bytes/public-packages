export type SmartURLSearchParamsConstructorParams = Record<
    string,
    string | string[] | number | number[] | undefined | null
>;

export type ArrayFormat = 'bracket' | 'index' | 'comma' | 'separator' | 'bracket-separator' | 'none';

export interface ToFormattedStringParams {
    arrayFormat?: ArrayFormat;
    arrayFormatSeparator?: string;
    forceArrayFields?: string[];
}

/**
 * An enhanced version of URLSearchParams with additional formatting capabilities.
 * Supports arrays, numbers, and handling of null and undefined values.
 * Allows custom array formatting for query strings.
 */
class SmartURLSearchParams extends URLSearchParams {
    /**
     * Creates a new instance of SmartURLSearchParams.
     * @param {SmartURLSearchParamsConstructorParams} params - An object of parameters supporting strings, arrays, numbers, null, and undefined.
     */
    constructor(params?: SmartURLSearchParamsConstructorParams) {
        super();

        if (!params) {
            return;
        }

        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                return;
            }

            if (Array.isArray(value)) {
                value.forEach((valueItem: string | number) => this.append(key, valueItem.toString()));
                return;
            }

            this.append(key, value.toString());
        });
    }

    /**
     * Formats the search parameters into a query string based on specified formatting options.
     * This method allows for advanced control over the representation of array values in the query string.
     *
     * @param {ToFormattedStringParams} options - The options for formatting the query string.
     * @param {ArrayFormat} [options.arrayFormat='none'] - Specifies how array values should be formatted in the query string.
     *    - 'bracket': Encodes arrays using brackets (e.g., 'key[]=value1&key[]=value2').
     *    - 'index': Encodes arrays with indexes (e.g., 'key[0]=value1&key[1]=value2').
     *    - 'comma': Encodes arrays with comma-separated values (e.g., 'key=value1,value2').
     *    - 'separator': Encodes arrays with a custom separator specified by arrayFormatSeparator (e.g., 'key=value1|value2' for '|').
     *    - 'bracket-separator': Encodes arrays using brackets and a custom separator (e.g., 'key[]=value1|value2' for '|').
     *    - 'none': Encodes arrays by repeating the key for each value (default behavior, e.g., 'key=value1&key=value2').
     * @param {string} [options.arrayFormatSeparator=','] - The separator character used for array encoding when 'separator' or 'bracket-separator' is chosen as arrayFormat.
     * @param {string[]} [options.forceArrayFields=[]] - A list of keys that should always be formatted as arrays, even if they have a single value.
     *
     * @returns {string} A query string formatted according to the provided options.
     */
    toFormattedString({
        arrayFormat = 'none',
        arrayFormatSeparator = ',',
        forceArrayFields = []
    }: ToFormattedStringParams = {}): string {
        let queryStringParts: string[] = [];

        new Set(this.keys()).forEach((key) => {
            const values = this.getAll(key);

            if (values.length === 1 && !forceArrayFields.includes(key)) {
                const [value] = values;
                queryStringParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                return;
            }

            switch (arrayFormat) {
                case 'bracket':
                    values.forEach((value) => {
                        queryStringParts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(value)}`);
                    });
                    break;
                case 'index':
                    values.forEach((value, index) => {
                        queryStringParts.push(`${encodeURIComponent(key)}[${index}]=${encodeURIComponent(value)}`);
                    });
                    break;
                case 'comma':
                    queryStringParts.push(`${encodeURIComponent(key)}=${values.map(encodeURIComponent).join(',')}`);
                    break;
                case 'separator':
                    queryStringParts.push(
                        `${encodeURIComponent(key)}=${values.map(encodeURIComponent).join(arrayFormatSeparator)}`
                    );
                    break;
                case 'bracket-separator':
                    queryStringParts.push(
                        `${encodeURIComponent(key)}[]=${values.map(encodeURIComponent).join(arrayFormatSeparator)}`
                    );
                    break;
                case 'none':
                    queryStringParts.push(
                        values.map((value) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')
                    );
                    break;
                default:
                    throw new Error(`unknown arrayFormat(${arrayFormat})`);
            }
        });

        return queryStringParts.join('&');
    }
}

export default SmartURLSearchParams;
