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

### notes
- use `process.env.NODE_TLS_REJECT_UNAUTHORIZED` with value `0` if proxy has problems with API certificate

### version history

2.0.0
- first public version
