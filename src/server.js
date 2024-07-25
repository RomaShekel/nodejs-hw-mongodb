// /src/server.js

import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import cookieParser from 'cookie-parser'

import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import Routers from './routers/index.js'
import { UPLOAD_DIR } from './constants/index.js';

const PORT =  Number(process.env.PORT) ? Number(process.env.PORT) : 3000;

export const setupServer = () => {

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(cookieParser());
    app.use('/uploads', express.static(UPLOAD_DIR));

    app.use(
        pino({
        transport: {
            target: 'pino-pretty',
        },
        }),
    );


    app.use(Routers);

    app.use('*', notFoundHandler);

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}
