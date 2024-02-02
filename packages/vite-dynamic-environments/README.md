# Dynamic Environments Support Rollup Plugin

This plugin provides support for dynamic environments for projects using Vite. It provides automatic generation of scripts with environment variables during development, making it easy to work with different environment configurations.

## Installation

Install the plugin using npm:

```bash
npm install @37bytes/rollup-plugin-dynamic-environments --save-dev
```

## Usage
```
// vite.config.js
import dynamicEnvironmentsSupport from '@37bytes/vite-dynamic-environments';

export default {
  plugins: [
    dynamicEnvironmentsSupport({
      // Plugin parameters (optional, default values are specified)
      scriptLink: '/dynamicEnvironment.js', // Link to connect the script in HTML
      ignorePrefixes: ['VITE_'], // Environment variable prefixes to ignore
      dynamicEnvironmentsDir: 'environments/dynamic', // Directory with dynamic environment files
      outputDir: 'build-env' // Directory for outputting generated scripts
    })
  ]
};
```

## Options

### scriptLink
The link where the script with environment variables will be accessed during development (by default: ```'/dynamicEnvironment.js'```)

### ignorePrefixes
Prefixes of environment variables to be ignored during script generation (by default: ```['VITE_']```)

### dynamicEnvironmentsDir
The directory with dynamic environment files (by default: ```'environments/dynamic'```)

### outputDir
Directory for outputting generated scripts (by default: ```'build-env'```)
