

### Usage

1. `prepare-environment ENV_NAME=stage`
   In this case app looking for .preparerc automatically. The file must be located in the root.

2. `prepare-environment ENV_NAME=stage CONFIG_PATH=configs/.preparerc`  
   In this case app get .preparerc file from the custom path.

### Optional parameters default values
- CONFIG_PATH = `/`,

### Local developing
1. `ts-node src/index.ts <...>`
2. `npm run build&watch`; `node build/index.js <...>`
3. `npm run build`; `chmod +x build/index.js`; `npm link`; `prepare-environment <...>`

### version history

[//]: # (1.0.0)

[//]: # (- first version)
