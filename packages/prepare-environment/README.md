

### Usage

1. `prepare-environment ENV_NAME=stage`
   In this case app looking for `.environmentrc` automatically. The file must be located in the root.

2. `prepare-environment ENV_NAME=stage CONFIG_PATH=configs/.preparerc`  
   In this case app get `.environmentrc` file from the custom path.

### Optional parameters default values
- CONFIG_PATH = `/`,

### Local developing
1. `create ./environments/.env.stage (env file must match ENV_NAME=stage)`
2. `ts-node src/index.ts <...>`
3. `npm run build&watch`; `node build/index.js <...>`
4. `npm run build`; `chmod +x build/index.js`; `npm link`; `prepare-environment <...>`
5. `example: ts-node src/index.ts CONFIG_PATH=__fixtures__/.environmentrc ENV_NAME=stage`

### version history

1.0.2
- update .npmignore

1.0.1 
- fix small bugs

1.0.0
- first version
