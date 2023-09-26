### About 

A set of utilities to enhance work with internal environments.

### Installation

Run the following command to install the package:

```sh
npm install --save-dev stylelint @37bytes/environment-info
```

### Description

#### getEnvironmentInfo
A utility for retrieving information about the current application version and the current environment. When called, it returns a string.

It takes an object with the following fields as input:

| Params       |  Type   | Required  |                          Description |
|--------------|:-------:|:---------:|-------------------------------------:|
| stand        | string  |     +     |                           Stand name |
| version      | string  |     -     |          Current Application Version |
| commitHash   | string  |     -     |                       Current Commit |
| branch       | string  |     -     |                       Current Branch |
| isProduction | boolean |     -     |     Production Environment Indicator |

If ``isProduction = true``, the response will be in the form of:
``${version}``,
otherwise, the utility will return a string in the form of:
``${version}|${stand}; ${branch}#${commitHash}``

**Important**: When determining whether it's a production environment, we use a list of internal environments, not a list of production environments.

```javascript
const isProductionEnvironment = (envName: string) => {
    if (import.meta.env.DEV) {
        return false;
    }
    
    if (['test', 'stage'].includes(envName)) {
        return false;
    }
    
    return true;
}
```

#### startEnvironmentTitleWatcher
A utility for adding the stand name to the title of the browser tab. 
It takes one argument: ``standName: string``


###Version History

1.0.0
- Initial release.
