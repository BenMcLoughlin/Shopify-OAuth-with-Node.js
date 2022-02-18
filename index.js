import express from 'express';
import dotenv from 'dotenv';
import { Shopify } from '@shopify/shopify-api';
dotenv.config();

const host = '127.0.0.1';
const port = 3000;

const app = express();

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_API_SCOPES, HOST } = process.env;

const shops = {
    session: {}
};

Shopify.Context.initialize({
    API_KEY: SHOPIFY_API_KEY,
    API_SECRET_KEY: SHOPIFY_API_SECRET,
    SCOPES: SHOPIFY_API_SCOPES,
    HOST_NAME: HOST,
    IS_EMBEDDED_APP: true
});

app.get('/', async (req, res) => {
    console.log('/index.js -  SHOPIFY_API_KEY: ', SHOPIFY_API_KEY);
    console.log('/index.js - SHOPIFY_API_SECRET: ', SHOPIFY_API_SECRET);
    console.log('/index.js - SHOPIFY_API_SCOPES: ', SHOPIFY_API_SCOPES);
    console.log('/index.js - HOST: ', HOST);
    if (typeof shops[req.query.shop] !== 'undefined') {
        res.send('Hello world');
    } else if (req.query.shop?.length > 0) {
        console.log('/index.js - req.query.shop: ', req.query.shop);
        res.redirect(`/auth?shop=${req.query.shop}`);
    }
    res.send('Didnt provide the shopify body parameters');
});

app.get('/auth', async (req, res) => {
    console.log('Hit Auth Route, about to send user to begin auth');
    const authRoute = await Shopify.Auth.beginAuth(req, res, req.query.shop, '/auth/callback', false);

    res.redirect(authRoute);
});

app.get('/auth/callback', async (req, res) => {
    console.log('/index.js - req.query: ', req.query);
    const shopSession = await Shopify.Auth.validateAuthCallback(req, res, req.query);
    shops.session = shopSession;
    console.log('/index.js - shopSession : ', shopSession )
    res.redirect(`https://${shopSession.shop}/admin/apps`);
});

app.listen(port, () => {
    console.log(`server running on http://${host}:${port}`);
});
//ngrok http --region=us --hostname=bens.ngrok.io 80
