'use strict';

const { expect } = require('chai');
const asyncIteratorUtils = require('./async-iterator-utils.js');

describe('{ promiseUtils } provides functionality that extends behavior for promises (a.k.a. asynchronous tasks)', function () {
    const {
        states,
        promiseUtils
    } = require('./promise-utils.js');

    context('{ states }', function () {
        context('when promise states are needed', function () {
            it('provides the accurate values that are used internally by the API', function () {
                // ASSERT: the constants values are what's expected
                expect(states.FULFILLED).to.eql('fulfilled');
                expect(states.REJECTED).to.eql('rejected');
            });
        });
    });

    context('{ promiseUtils.allSettled }', function () {
        context('when multiple promises finish at different times', function () {
            it('waits until all promises settle before it always succeeds (regardless of how many promises fail)', async function () {
                // ARRANGE: a promise that resolves (eventually)
                const a = promiseUtils.delayResolve('a-resolved', 25);
                // ARRANGE: a promise that rejects (eventually)
                const b = promiseUtils.delayReject('b-rejected', 15);

                // ACT: wait until both promises settle
                const result = await promiseUtils.allSettled([a, b]);

                // ASSERT: the response from joining all promises
                expect(result).to.eql([
                    { state: states.FULFILLED, value: 'a-resolved' },
                    { state: states.REJECTED, reason: 'b-rejected' }
                ]);
            });
        });
    });

    context('{ promiseUtils.allSettledIterable }', function () {
        context('when multiple promises finish at different times', function () {
            it('iterates through all promises in the order they are settled, but the resolution is always a success (regardless of how many promises fail) (EXAMPLE #1)', async function () {
                // ARRANGE: a promise that resolves but settles the latest
                const a = promiseUtils.delayResolve('a-resolved', 25);
                // ARRANGE: a promise that rejects and settles the fastest
                const b = promiseUtils.delayReject('b-rejected', 15);

                // ACT: wait until both promises settle
                const result = await asyncIteratorUtils.toArrayAsync(promiseUtils.allSettledIterable([a, b]));

                // ASSERT: the response from joining all promises
                expect(result).to.eql([
                    { state: states.REJECTED, reason: 'b-rejected', index: 1 },
                    { state: states.FULFILLED, value: 'a-resolved', index: 0 }
                ]);
            });

            it('iterates through all promises in the order they are settled, but the resolution is always a success (regardless of how many promises fail) (EXAMPLE #2)', async function () {
                // ARRANGE: a promise that resolves and settles the fastest
                const a = promiseUtils.delayResolve('a-resolved', 15);
                // ARRANGE: a promise that rejects but settles the slowest
                const b = promiseUtils.delayReject('b-rejected', 25);

                // ACT: wait until both promises settle
                const result = await asyncIteratorUtils.toArrayAsync(promiseUtils.allSettledIterable([a, b]));

                // ASSERT: the response from joining all promises
                expect(result).to.eql([
                    { state: states.FULFILLED, value: 'a-resolved', index: 0 },
                    { state: states.REJECTED, reason: 'b-rejected', index: 1 }
                ]);
            });
        });
    });

    context('{ promiseUtils.afterSettled }', function () {
        context('when multiple promises finish at different times', function () {
            it('waits until all promises resolve successfully, so the resolution is also a success with the array of all the values from the promises involved', async function () {
                // ARRANGE: a promise that resolves
                const a = Promise.resolve('a-resolved');
                // ARRANGE: a promise that resolves
                const b = Promise.resolve('b-resolved');

                // ACT: wait until both promises settle
                const result = await promiseUtils.afterSettled([a, b]);

                // ASSERT: the response from joining all promises
                expect(result).to.eql(['a-resolved', 'b-resolved']);
            });

            it('waits until all promises settle, but the resolution is a failure due to at least one of the promises failing, and the error contains the list of the reasons from the promises involved', async function () {
                // ARRANGE: a promise that resolves
                const a = Promise.resolve('a-resolved');
                // ARRANGE: a promise that rejects
                const b = Promise.reject('b-rejected');

                try {
                    // ACT: wait until both promises settle
                    await promiseUtils.afterSettled([a, b]);
                    // ASSERT: resolution was supposed to fail
                    expect.fail();
                } catch (e) {
                    // ASSERT: the response includes the list of reasons for the failure
                    expect(e).to.eql(['b-rejected']);
                }
            });

            it('waits until all promises settle, but the resolution is a failure due to all promises failing, and the error contains the list of the reasons from all the promises involved', async function () {
                // ARRANGE: a promise that rejects
                const a = Promise.reject('a-rejected');
                // ARRANGE: a promise that rejects
                const b = Promise.reject('b-rejected');

                try {
                    // ACT: wait until both promises settle
                    await promiseUtils.afterSettled([a, b]);
                    // ASSERT: resolution was supposed to fail
                    expect.fail();
                } catch (e) {
                    // ASSERT: the response includes the list of reasons for the failure
                    expect(e).to.eql(['a-rejected', 'b-rejected']);
                }
            });
        });
    });

    context('{ promiseUtils.timedOrResolve }', function () {
        context('when a promise needs to have a timeout attached to it and that promise is guaranteed to resolve if the timeout occurs', function () {
            it('could reject before the timeout occurs, and the default value is ignored (timeout value)', async function () {
                // ARRANGE: a promise destined to be rejected before the timeout occurs
                const promise = promiseUtils.timedOrResolve((resolve, reject) => reject('a-rejected'), 0, 'a-resolved-timed');

                try {
                    // ACT: wait until the promise settles
                    await promise;
                    // ASSERT: resolution was supposed to fail
                    expect.fail();
                } catch (e) {
                    // ASSERT: the response of the promise
                    expect(e).to.eql('a-rejected');
                }
            });

            it('resolves after the timeout occurs, and the default value is the value of the resolution (timeout value)', async function () {
                // ARRANGE: a promise destined to be rejected after the timeout occurs
                const promise = promiseUtils.timedOrResolve((resolve, reject) => setTimeout(reject, 30, 'a-rejected'), 25, 'a-resolved-timed');

                // ACT: wait until the promise settles
                const result = await promise;

                // ASSERT: the response of the promise
                expect(result).to.eql('a-resolved-timed');
            });
        });
    });

    context('{ promiseUtils.timedOrReject }', function () {
        context('when a promise needs to have a timeout attached to it and that promise is guaranteed to reject if the timeout occurs', function () {
            it('could resolve before the timeout occurs, and the default reason is ignored (timeout reason)', async function () {
                // ARRANGE: a promise destined to be resolved before the timeout occurs
                const promise = promiseUtils.timedOrReject(resolve => resolve('a-resolved'), 0, 'a-rejected-timed');

                // ACT: wait until the promise settles
                const result = await promise;

                // ASSERT: the response of the promise
                expect(result).to.eql('a-resolved');
            });

            it('rejects after the timeout occurs, and the default reason is the reason of the rejection (timeout reason)', async function () {
                // ARRANGE: a promise destined to be resolved after the timeout occurs
                const promise = promiseUtils.timedOrReject(resolve => setTimeout(resolve, 30, 'a-resolved'), 25, 'a-rejected-timed');

                try {
                    // ACT: wait until the promise settles
                    await promise;
                    // ASSERT: resolution was supposed to fail
                    expect.fail();
                } catch (e) {
                    // ASSERT: the response of the promise
                    expect(e).to.eql('a-rejected-timed');
                }
            });
        });
    });

    context('{ promiseUtils.delayResolve }', function () {
        context('when a promise needs to be delayed before it is resolved', function () {
            it('delays the resolution by the specified amount of time', async function () {
                // ARRANGE: a promise that resolves (eventually)
                const promise = promiseUtils.delayResolve('a-resolved', 25);

                // ACT: wait until the promise settles
                const result = await promise;

                // ASSERT: the response of the promise
                expect(result).to.eql('a-resolved');
            });
        });
    });

    context('{ promiseUtils.delayReject }', function () {
        context('when a promise needs to be delayed before it is rejected', function () {
            it('delays the rejection by the specified amount of time', async function () {
                // ARRANGE: a promise that rejects (eventually)
                const promise = promiseUtils.delayReject('a-rejected', 25);

                try {
                    // ACT: wait until the promise settles
                    await promise;
                    // ASSERT: resolution was supposed to fail
                    expect.fail();
                } catch (e) {
                    // ASSERT: the response of the promise
                    expect(e).to.eql('a-rejected');
                }
            });
        });
    });
});