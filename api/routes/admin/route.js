import express from "express";
import { validationResult } from 'express-validator';

import * as get from './queries/get.js';
import * as put from './queries/put.js';
import * as post from './queries/post.js';
import * as del from './queries/delete.js';

import * as putValidator from './middlewares/validators/put.js';
import * as postValidator from './middlewares/validators/post.js';

const route = express.Router();

/**Middlewares */
import {upload, resize} from './middlewares/storage.js';

/**Let the client know if it's authenticated */
route.get('/isLoggedIn', async(req, res) => {
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'No credentials sent' });
    } else {
        const auth = (Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf8')).split(':');
        const signed = await get.isLoggedIn({email: auth[0], pwdHash: auth[1]});

        if(!signed) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }else {
            return res.status(200).json();
        }
    }
});

/**Authentication Middleware */
route.use('*', async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'No credentials sent' });
    } else {
        const auth = (Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf8')).split(':');

        const signed = await get.isLoggedIn({email: auth[0], pwdHash: auth[1]});

        if(!signed) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }
    }
    next();
});

/**Admin route */
route.get('/:action', async (req,res) => {
    const method = get[req.params.action];
    if(!method) return res.status(404).json({ error: 'Not Found' });

    return res.json(await method());
});

route.put('/updateAd', upload, resize,
    async (req, res, next) => {
        const validator = putValidator.updateAd;

        await Promise.all(
            validator.map(validation => validation.run(req))
        );

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        return res.status(422).json({ errors: errors.array() });
    },
    async (req, res) => {
        await put.updateAd({...req.body, imgFileName: req.file.filename});
        res.json();
    }
);

route.put('/:action',
    async (req, res, next) => {
        const validator = putValidator[req.params.action];
        if(!validator)
            return next();

        await Promise.all(
            validator.map(validation => validation.run(req))
        );

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        return res.status(422).json({ errors: errors.array() });
    }, async (req,res) => {
        const method = put[req.params.action];
        if(!method) return res.status(404).json({ error: 'Not Found' });

        await method(req.body);
        return res.json();
    }
);

route.post('/createAd', upload, resize,
    async (req, res, next) => {
        const validator = postValidator.createAd;

        await Promise.all(
            validator.map(validation => validation.run(req))
        );

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        return res.status(422).json({ errors: errors.array() });
    },
    async (req, res) => {
        await post.createAd({...req.body, imgFileName: req.file.filename});
        res.json();
    }
);

route.post('/:action', async (req, res, next) => {
    const validator = postValidator[req.params.action];
    if(!validator)
        return next();

    await Promise.all(
        validator.map(validation => validation.run(req))
    );

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(422).json({ errors: errors.array() });
}, async (req,res) => {
    const method = post[req.params.action];
    if(!method) return res.status(404).json({ error: 'Not Found' });

    return res.json(await method(req.body));
});

route.delete('/:action', async (req,res) => {
    const method = del[req.params.action];
    if(!method) return res.status(404).json({ error: 'Not Found' });

    await method(req.body);
    return res.json();
});

route.use('*', (req, res) => res.status(404).json({error: 'Not Found'}));

export default route;