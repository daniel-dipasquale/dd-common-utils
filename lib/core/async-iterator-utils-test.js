'use strict';

const { expect } = require('chai');

describe('{ asyncIteratorUtils } provides functionality that extends behavior for async generators (a.k.a. async iterator factories)', function () {
    const asyncIteratorUtils = require('./async-iterator-utils.js');

    context('{ asyncIteratorUtils.toArrayAsync }', function () {
        context('when an asynchronous iterable object is provided but an array is needed', function () {
            it('iterates through the iterator asynchronously and it provides the array once the iteration finishes', async function () {
                // ARRANGE: an asynchronous generator
                const input = (async function* () {
                    yield 't';
                    yield 'e';
                    yield 's';
                    yield 't';
                })();

                // ACT: iterate through the asynchronous generator and persist it into an array
                const result = await asyncIteratorUtils.toArrayAsync(input);

                // ASSERT: the array contains the iteration of the asynchronous generator
                expect(result).to.eql(['t', 'e', 's', 't']);
            });
        });
    });
});