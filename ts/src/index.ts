import '@babel/polyfill';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as asyncHandler from 'express-async-handler';
import 'reflect-metadata';

import config from './config';
import port from './port'
import { initDBConnectionAsync } from './db_connection';
import { Handlers } from './handlers';
import { errorHandler } from './middleware/error_handling';
import { urlParamsParsing } from './middleware/url_params_parsing';
import { utils } from './utils';

(async () => {
    await initDBConnectionAsync();
    const handlers = new Handlers();
    await handlers.initOrderBookAsync();
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(urlParamsParsing);
    app.use(express.static('public'));

    /**
     * GET version
     */
    app.get('/api/bookzaar/v0/version', asyncHandler(Handlers.getVersion.bind(Handlers)))

    /**
     * GET config
     */
    app.get('/api/bookzaar/v0/config', asyncHandler(Handlers.getConfig.bind(Handlers)))

    /**
     * GET version
     */
    app.get('/api/bookzaar/v0/assets/:address', asyncHandler(Handlers.getAsset.bind(Handlers)))

    /**
     * GET token
     */
    app.get('/api/bookzaar/v0/config', asyncHandler(Handlers.getConfig.bind(Handlers)))

    /**
     * GET AssetPairs endpoint retrieves a list of available asset pairs and the information required to trade them.
     * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getAssetPairs
     */
    app.get('/api/0x/v2/asset_pairs', asyncHandler(Handlers.assetPairsAsync.bind(Handlers)));
    /**
     * GET Orders endpoint retrieves a list of orders given query parameters.
     * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrders
     */
    app.get('/api/0x/v2/orders', asyncHandler(handlers.ordersAsync.bind(handlers)));
    /**
     * GET Orderbook endpoint retrieves the orderbook for a given asset pair.
     * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrderbook
     */
    app.get('/api/0x/v2/orderbook', asyncHandler(handlers.orderbookAsync.bind(handlers)));
    /**
     * POST Order config endpoint retrives the values for order fields that the relayer requires.
     * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrderConfig
     */
    app.post('/api/0x/v2/order_config', Handlers.orderConfig.bind(Handlers));
    /**
     * GET FeeRecepients endpoint retrieves a collection of all fee recipient addresses for a relayer.
     * http://sra-spec.s3-website-us-east-1.amazonaws.com/v2/fee_recipients
     */
    app.get('/api/0x//v2/fee_recipients', Handlers.feeRecipients.bind(Handlers));
    /**
     * POST Order endpoint submits an order to the Relayer.
     * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/postOrder
     */
    app.post('/api/0x/v2/order', asyncHandler(handlers.postOrderAsync.bind(handlers)));
    /**
     * GET Order endpoint retrieves the order by order hash.
     * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrder
     */
    app.get('/api/0x/v2/order/:orderHash', asyncHandler(Handlers.getOrderByHashAsync.bind(Handlers)));

    app.use(errorHandler);

    app.listen(port, () => {
        utils.log(
            `Standard relayer API (HTTP) listening on port ${port}!\nConfig: ${JSON.stringify(
                config,
                null,
                2,
            )}`,
        );
    });
})().catch(utils.log);
