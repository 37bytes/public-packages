### About the Project

stylelint configuration for use in 37bytes company projects. It's used to standardize the writing style of styles within the company.

### Used Rules

- Disallow selectors without classes.
- Disallow duplicate properties within a selector.
- Disallow duplicate selector names within a file.
- Disallow empty selectors.
- Limit the use of measurement units for font sizes (only px).
- Sort and group properties within a selector according to a specified order.
- Restrict the use of certain values for specific properties (for color, background-color, border-color, z-index, font-family, only variables can be used as values).
- Enforce a specific naming convention (lowerCamelCase) for identifiers.
- Disallow empty comments.

### Installation

Run the following command to install the package:

```sh
npm install --save-dev @37bytes/stylelint-config
```

### Usage

Create a `.stylelintrc` file in the root of your project and configure it as follows:

```json
{
    "extends": "@37bytes/stylelint-config"
}
```

If needed, you can further customize your configuration according to the [stylelint documentation](https://stylelint.io/).

Add the following command to your `package.json` to run the style check:

```
"lint:styles": "stylelint **/*.{scss,css} --fix"
```

### Version History

1.0.8
- Added documentation.

1.0.7
- Bug fix

1.0.6
- Bug fix

1.0.5
- Bug fix

1.0.4
- Bug fix

1.0.3
- Bug fix

1.0.2
- Bug fix

1.0.1
- Bug fix

1.0.0
- Initial version.
