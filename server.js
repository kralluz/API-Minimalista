const http = require('http');
const url = require('url');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const Router = require('router');

// Configurando variáveis de ambiente
dotenv.config();

class Response {
    constructor(res) {
        this.res = res;
    }

    json(data) {
        this.res.setHeader('Content-Type', 'application/json');
        this.res.end(JSON.stringify(data));
    }

    status(statusCode) {
        this.res.statusCode = statusCode;
        return this;
    }

    send(data) {
        this.res.end(data);
    }
}

class SimpleAPI {
    constructor() {
        this.router = Router();
        this.router.use(bodyParser.json());
        this.router.use(cors());
        this.globalMiddlewares = [];
    }

    use(middleware) {
        this.globalMiddlewares.push(middleware);
    }

    get(path, ...handlers) {
        this.router.get(path, this.applyMiddlewares(handlers));
    }

    post(path, ...handlers) {
        this.router.post(path, this.applyMiddlewares(handlers));
    }

    // Método para aplicar middlewares
    applyMiddlewares(handlers) {
        return (req, res) => {
            const response = new Response(res);
            const stack = [...this.globalMiddlewares, ...handlers];
            let index = 0;

            const next = (err) => {
                if (err) {
                    response.status(500).json({ error: 'Internal Server Error' });
                    return;
                }

                if (index >= stack.length) {
                    return;
                }

                const handler = stack[index++];
                handler(req, response, next);
            };

            next();
        };
    }

    handleRequest(req, res) {
        this.router(req, res, (err) => {
            if (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not Found' }));
            }
        });
    }

    listen(port, callback) {
        const server = http.createServer(this.handleRequest.bind(this));
        server.listen(port, callback);
    }
}

// Exemplo de uso
const api = new SimpleAPI();

// Middleware global
api.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware específico de rota
api.get('/', (req, res, next) => {
    console.log('GET /');
    next();
}, (req, res) => {
    res.json({ message: 'Hello, World!' });
});

api.post('/data', (req, res, next) => {
    console.log('POST /data');
    next();
}, (req, res) => {
    const data = req.body;
    res.json({ receivedData: data });
});

const PORT = process.env.PORT || 3010;
api.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
