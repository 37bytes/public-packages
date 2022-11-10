### arguments
```dotenv
PORT=9000
PATH_TO_CONFIG=.env.proxy
PROXY_MODE=json
```

PROXY_MODE values: `json` (default), `file`.

### .env
```dotenv
API_HOST=www.example.com
COOKIE=demo=debug;test=123
```

### usage
- `touch .env.proxy`
- fill config
- `npx -y front-proxy` or `npx -y front-proxy PORT=9001 PATH_TO_CONFIG=proxy/.env.proxy PROXY_MODE=file`

Yes, that's it.

### [nodemon](https://www.npmjs.com/package/nodemon)

Package `nodemon` helps automatically relaunch proxy on config updates.

package.json:
```json
{
  "proxy": "npx -y @37bytes/front-proxy PATH_TO_CONFIG=proxy/.env.proxy",
  "proxy-dmn": "npx -y nodemon --watch proxy/.env.proxy --exec npm run proxy",
}
```
Thanks [@MRGRD56](https://github.com/MRGRD56) for research.

### notes
- use `process.env.NODE_TLS_REJECT_UNAUTHORIZED` with value `0` if proxy has problems with API certificate

### version history

2.0.0
- first public version
