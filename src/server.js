// /src/server.js

import express from 'express';
import cors from 'cors';
import pino from 'pino-http';

import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import contactsRouter from './routers/contacts.js'

const PORT =  Number(process.env.PORT) ? Number(process.env.PORT) : 3000;

export const setupServer = () => {

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use(
        pino({
        transport: {
            target: 'pino-pretty',
        },
        }),
    );


    app.use(contactsRouter);

    app.use('*', notFoundHandler);

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}
