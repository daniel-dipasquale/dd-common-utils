'use strict';

const AsyncIteratorUtils = class {
    async toArrayAsync(asyncIterable) {
        const array = [];

        for await (const item of asyncIterable) {
            array.push(item);
        }

        return array;
    }
};

module.exports = new AsyncIteratorUtils();