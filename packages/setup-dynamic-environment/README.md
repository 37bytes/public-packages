# Setup Dynamic Environment Plugin

This plugin provides a command-line utility to recursively replace placeholder strings in JavaScript files within a specified directory with dynamic environment values.

## Installation

```
npm install dynamic-environment-replacer
```

# Usage
"scripts" section in package.json
```
"build": " your_build_script && dynamic-environment-replacer --TARGET_DIRECTORY=<target_directory> --ENVIRONMENT_CONFIG=<environment_config>"
```
### TARGET_DIRECTORY: 
The target directory containing JavaScript files where replacements will be made.

### ENVIRONMENT_CONFIG: 
The path to the environment configuration file in dotenv format.

### Example

```
"build": "rimraf build && npm run prebuild && setup-dynamic-environment TARGET_DIRECTORY=build ENVIRONMENT_CONFIG=.env.production",
```

# Dynamic Replacement

The plugin will replace the placeholder string ```"__PLACE_FOR_DYNAMIC_ENVIRONMENT__"``` with the serialized representation of the environment variables defined in the specified ENVIRONMENT_CONFIG file.
