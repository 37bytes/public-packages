### Usage

1. `html-content-appender HTML_DIRECTORY=./build TEMPLATE=./extra-html-content.html`
2. `html-content-appender HTML_DIRECTORY=./build TEMPLATE=./extra-html-content.html EXCLUDED_FILES=index.html,example.html`

### Local developing
1. `ts-node src/index.ts <...>`
2. `npm run build&watch`; `node build/index.js <...>`
3. `npm run build`; `chmod +x build/index.js`; `npm link`; `html-content-appender <...>`

### version history

1.0.1
- first version
