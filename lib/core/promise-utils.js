'use strict';

const states = {
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected'
};

const AllSettledUtils = (function () {
    const constants = {
        fulfilledHandler: function (value) {
            return {
                state: states.FULFILLED,
                value
            };
        },
        rejectedHandler: function (reason) {
            return {
                state: states.REJECTED,
                reason
            };
        },
        createResolvedPromise: function (promise) {
            return Promise.resolve(promise).then(constants.fulfilledHandler).catch(constants.rejectedHandler);
        }
    };

    return class {
        toResolvedPromises(promises) {
            return promises.map(constants.createResolvedPromise);
        }
    };
})();

const AllSettledIterableUtils = class {
    static _toExternallyResolvablePromisePairs(promises) {
        const promiseResolvers = [];

        return {
            promiseResolvers,
            promises: promises.map(() => new Promise(function (resolve, reject) {
                promiseResolvers.push({ resolve, reject });
            }))
        };
    }

    static _createFulfilledHandler(context, index) {
        return function (value) {
            context.promiseResolvers[context.index++].resolve({
                state: states.FULFILLED,
                value,
                index
            });
        };
    }

    static _createRejectedHandler(context, index) {
        return function (reason) {
            context.promiseResolvers[context.index++].resolve({
                state: states.REJECTED,
                reason,
                index
            });
        };
    }

    async *resolveInSettlementOrder(promises) {
        const context = {
            ...AllSettledIterableUtils._toExternallyResolvablePromisePairs(promises),
            index: 0
        };

        for (let i = 0; i < promises.length; i++) {
            let promise = promises[i];
            let fulfilledHandler = AllSettledIterableUtils._createFulfilledHandler(context, i);
            let rejectedHandler = AllSettledIterableUtils._createRejectedHandler(context, i);

            Promise.resolve(promise).then(fulfilledHandler).catch(rejectedHandler);
        }

        yield* context.promises;
    }
};

const AfterSettledBuilder = (function () {
    const accessorNames = {
        [states.FULFILLED]: 'value',
        [states.REJECTED]: 'reason'
    };

    return class {
        initialize() {
            this._results = {
                [states.FULFILLED]: [],
                [states.REJECTED]: []
            };
        }

        finalize() {
            delete this._results;
        }

        classifyResults(result) {
            const accessorName = accessorNames[result.state];

            this._results[result.state].push(result[accessorName]);
        }

        async createPromise() {
            if (this._results[states.REJECTED].length > 0) {
                return Promise.reject(this._results[states.REJECTED]);
            }

            return Promise.resolve(this._results[states.FULFILLED]);
        }
    };
})();

const TimedUtils = class {
    static async _createConditionalPromise(synchronization, executor) {
        return new Promise(function (resolve, reject) {
            const res = function () {
                if (synchronization.settled) {
                    return;
                }

                synchronization.settled = true;
                clearTimeout(synchronization.timeoutId);
                resolve(...arguments);
            };

            const rej = function () {
                if (synchronization.settled) {
                    return;
                }

                synchronization.settled = true;
                clearTimeout(synchronization.timeoutId);
                reject(...arguments);
            };

            executor(res, rej);
        });
    }

    static async _createTimedPromise(synchronization, timeout, handlerIndex, settlement) {
        return new Promise(function () {
            const settlerHandler = arguments[handlerIndex];

            synchronization.timeoutId = setTimeout(function () {
                synchronization.settled = true;
                settlerHandler(settlement);
            }, timeout);
        });
    }

    async _createTimedOrSettle(executor, timeout, handlerIndex, settlementValue) {
        const synchronization = {};
        const conditionalPromise = TimedUtils._createConditionalPromise(synchronization, executor);
        const timedPromise = TimedUtils._createTimedPromise(synchronization, timeout, handlerIndex, settlementValue);

        return Promise.race([conditionalPromise, timedPromise]);
    }

    async createTimedOrResolve(executor, timeout, value) {
        return this._createTimedOrSettle(executor, timeout, 0, value);
    }

    async createTimedOrReject(executor, timeout, reason) {
        return this._createTimedOrSettle(executor, timeout, 1, reason);
    }
};

const PromiseUtils = class {
    constructor() {
        this._allSettledUtils = new AllSettledUtils();
        this._allSettledIterableUtils = new AllSettledIterableUtils();
        this._timedUtils = new TimedUtils();
    }

    async allSettled(promises) {
        const resolvedPromises = this._allSettledUtils.toResolvedPromises(promises);

        return Promise.all(resolvedPromises);
    }

    allSettledIterable(promises) {
        return this._allSettledIterableUtils.resolveInSettlementOrder(promises);
    }

    async afterSettled(promises) {
        const afterSettledBuilder = new AfterSettledBuilder();
        const results = await this.allSettled(promises);

        afterSettledBuilder.initialize();
        results.forEach(afterSettledBuilder.classifyResults, afterSettledBuilder);

        try {
            return afterSettledBuilder.createPromise();
        } finally {
            afterSettledBuilder.finalize();
        }
    }

    async timedOrResolve(executor, timeout, value) {
        return this._timedUtils.createTimedOrResolve(executor, timeout, value);
    }

    async timedOrReject(executor, timeout, reason) {
        return this._timedUtils.createTimedOrReject(executor, timeout, reason);
    }

    async delayResolve(value, timeout) {
        return new Promise(function (resolve) {
            setTimeout(resolve, timeout, value);
        });
    }

    async delayReject(reason, timeout) {
        return new Promise(function (resolve, reject) {
            setTimeout(reject, timeout, reason);
        });
    }

    async delay(promise, timeout) {
        return new Promise(function (resolve, reject) {
            setTimeout(promise.then.bind(promise), timeout, resolve, reject);
        });
    }
};

module.exports = {
    states,
    promiseUtils: new PromiseUtils()
};