'use strict';

const IteratorUtils = class {
    static _isGenerator(iterable) {
        return iterable && typeof iterable[Symbol.iterator] === 'function';
    }

    *default(iterable) {
        if (IteratorUtils._isGenerator(iterable)) {
            yield* iterable;
        }
    }

    *skip(iterable, skip) {
        if (Array.isArray(iterable)) {
            for (let i = skip; i < iterable.length; i++) {
                yield iterable[i];
            }
        } else if (IteratorUtils._isGenerator(iterable)) {
            const iterator = iterable[Symbol.iterator]();
            let item = null;
            let hasMore = true;

            for (let i = 0, count = skip; i < count && hasMore; i++) {
                item = iterator.next();
                hasMore = !item.done;
            }

            if (hasMore) {
                for (item = iterator.next(); !item.done; item = iterator.next()) {
                    yield item.value;
                }
            }
        }
    }

    *reiterable(iterable, times) {
        if (Array.isArray(iterable) || IteratorUtils._isGenerator(iterable)) {
            if (times === 1) {
                yield* iterable;
            }

            if (times > 1) {
                const array = Array.from(iterable);

                for (let i = 0; i < times; i++) {
                    yield* array;
                }
            }
        }
    }

    *_reverse(iterable) {
        if (Array.isArray(iterable)) {
            for (let i = iterable.length - 1; i >= 0; i--) {
                yield iterable[i];
            }
        } else if (IteratorUtils._isGenerator(iterable)) {
            const array = Array.from(iterable);

            yield* this._reverse(array);
        }
    }

    reverse(iterable) {
        return this._reverse(iterable);
    }
};

const DoneAwareIterator = class {
    constructor(iterator) {
        this._iterator = iterator;
    }

    next() {
        const item = this._iterator.next();

        this.done = item.done;

        return item;
    }
};

const DoneAwareGenerator = class {
    constructor(generator) {
        this._generator = generator;
    }

    [Symbol.iterator]() {
        const iterator = this._generator[Symbol.iterator]();

        return new DoneAwareIterator(iterator);
    }
};

const IteratorUtilsProxyFactory = class {
    constructor() {
        this._propertyNamesNotAllowed = {
            'constructor': true,
            '_reverse': true
        };
    }

    static _createProxy(iteratorUtils, methodName) {
        return function () {
            const generator = iteratorUtils[methodName].apply(iteratorUtils, [...arguments]);

            return new DoneAwareGenerator(generator);
        };
    }

    createProxy(iteratorUtils) {
        const proxy = {};

        for (const propertyName of Object.getOwnPropertyNames(IteratorUtils.prototype)) {
            if (!this._propertyNamesNotAllowed[propertyName]) {
                proxy[propertyName] = IteratorUtilsProxyFactory._createProxy(iteratorUtils, propertyName);
            }
        }

        return proxy;
    }
};

module.exports = new IteratorUtilsProxyFactory().createProxy(new IteratorUtils());