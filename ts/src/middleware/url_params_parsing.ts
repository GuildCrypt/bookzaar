import * as express from 'express';
import * as _ from 'lodash';

import config from '../config';
import { ValidationError } from '../errors';

/**
 * Parses URL params and stores them on the request object
 */
export function urlParamsParsing(req: express.Request, _res: express.Response, next: express.NextFunction): void {
    const networkId = parseNetworkId(req.query.networkId);
    // HACK: This is the recommended way to pass data from middlewares on. It's not beautiful nor fully type-safe.
    req.networkId = networkId;
    next();
}

function parseNetworkId(networkIdStrIfExists?: string): number {
    if (_.isUndefined(networkIdStrIfExists)) {
        return config.networkId;
    } else {
        const networkId = _.parseInt(networkIdStrIfExists);
        if (networkId !== config.networkId) {
            const validationErrorItem = {
                field: 'networkId',
                code: 1004,
                reason: `Incorrect Network ID: ${networkIdStrIfExists}`,
            };
            throw new ValidationError([validationErrorItem]);
        }
        return networkId;
    }
}
