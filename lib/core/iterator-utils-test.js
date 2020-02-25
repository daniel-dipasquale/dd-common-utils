'use strict';

const { expect } = require('chai');

const Asserter = class {
    expectIsGeneratorWithOutput(generator, result) {
        // ASSERT: the result is an instance of a generator
        expect(generator).to.satisfy(r => typeof r[Symbol.iterator] === 'function');
        // ASSERT: the iteration of the generator is the original iterable
        expect(Array.from(generator)).to.eql(result);
    }

    expectIsGeneratorWithDoneAwareManualIteration(generator, result) {
        // ACT: the iterator for the given the iterable object
        const iterator = generator[Symbol.iterator]();

        // ASSERT: the property done is missing
        expect(iterator.done).to.be.undefined;

        // ACT: persist the iteration into an array
        const items = new Array(result.length).fill(0).map(() => iterator.next().value);

        // ASSERT: the property done is false
        expect(iterator.done).to.be.false;
        // ASSERT: the array is the input broken down by letter
        expect(items).to.eql(result);

        // ACT: iterate past the last element to know it's done
        iterator.next();

        // ASSERT: the property done is true
        expect(iterator.done).to.be.true;
    }
};

describe('{ iteratorUtils } provides functionality that extends behavior for generators (a.k.a. iterator factories)', function () {
    const iteratorUtils = require('./iterator-utils.js');
    const asserter = new Asserter();

    context('{ iteratorUtils.default }', function () {
        context('when an iterable object is provided but a GENERATOR is needed', function () {
            it('creates a generator that iterates through the given array', function () {
                // ARRANGE: the iterable object
                const input = ['t', 'e', 's', 't'];

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.default(input);

                // ASSERT: the generator is of expected type and it generates the expected iteration
                asserter.expectIsGeneratorWithOutput(result, ['t', 'e', 's', 't']);
            });

            it('creates a generator that iterates through the given string', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.default(input);

                // ASSERT: the generator is of expected type and it generates the expected iteration
                asserter.expectIsGeneratorWithOutput(result, ['t', 'e', 's', 't']);
            });

            it('creates a generator that iterates through the given generator', function () {
                // ARRANGE: the iterable object
                const input = (function *() {
                    yield 't';
                    yield 'e';
                    yield 's';
                    yield 't';
                })();

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.default(input);

                // ASSERT: the generator is of expected type and it generates the expected iteration
                asserter.expectIsGeneratorWithOutput(result, ['t', 'e', 's', 't']);
            });
        });

        context('when a NON-iterable object is provided but a GENERATOR is needed', function () {
            it('creates a generator that yields an empty set', function () {
                // ARRANGE: the NON-iterable object
                const input = null;

                // ACT: the generator that will create iterators given the NON-iterable object
                const result = iteratorUtils.default(input);

                // ASSERT: the generator is of expected type and it generates the expected iteration
                asserter.expectIsGeneratorWithOutput(result, []);
            });
        });

        context('when an iterable object is provided but an ITERATOR is needed', function () {
            it('creates a generator that yields an iterator that iterates through every item one by one', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the iterator for the given the iterable object
                const result = iteratorUtils.default(input);

                // ASSERT: the generator is of expected type and it manually iterates through sequence generating the expected array
                asserter.expectIsGeneratorWithDoneAwareManualIteration(result, ['t', 'e', 's', 't']);
            });
        });
    });

    context('{ iteratorUtils.skip }', function () {
        context('when an iterable object is provided but a GENERATOR that is able to skip the first N-TH items is needed', function () {
            it('creates a generator that iterates through the given array', function () {
                // ARRANGE: the iterable object
                const input = ['t', 'e', 's', 't'];

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.skip(input, 2);

                // ASSERT: the generator is of expected type and the iteration of it yields the items that were not skipped
                asserter.expectIsGeneratorWithOutput(result, ['s', 't']);
            });

            it('creates a generator that iterates through the given string', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.skip(input, 2);

                // ASSERT: the generator is of expected type and the iteration of it yields the items that were not skipped
                asserter.expectIsGeneratorWithOutput(result, ['s', 't']);
            });

            it('creates a generator that iterates through the given generator', function () {
                // ARRANGE: the iterable object
                const input = (function *() {
                    yield 't';
                    yield 'e';
                    yield 's';
                    yield 't';
                })();

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.skip(input, 2);

                // ASSERT: the generator is of expected type and the iteration of it yields the items that were not skipped
                asserter.expectIsGeneratorWithOutput(result, ['s', 't']);
            });
        });

        context('when an NON-iterable object is provided but a GENERATOR that is able to skip the first N-TH items is needed', function () {
            it('creates a generator that yields an empty set', function () {
                // ARRANGE: the NON-iterable object
                const input = null;

                // ACT: the generator that will create iterators given the NON-iterable object
                const result = iteratorUtils.skip(input, 2);

                // ASSERT: the generator is of expected type and it generates the expected iteration
                asserter.expectIsGeneratorWithOutput(result, []);
            });
        });

        context('when an iterable object is provided but a GENERATOR that skips more items that it has is needed', function () {
            it('creates a generator that yields an empty set', function () {
                // ARRANGE: the iterable object
                const input = (function *() {
                    yield 't';
                    yield 'e';
                    yield 's';
                    yield 't';
                })();

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.skip(input, 5);

                // ASSERT: the generator is of expected type and it generates the expected iteration
                asserter.expectIsGeneratorWithOutput(result, []);
            });
        });

        context('when an iterable object is provided but an ITERATOR that is able to skip the first N-TH items is needed', function () {
            it('creates a generator that yields an iterator that iterates through every item after the first N-TH one, but one by one', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the iterator for the given the iterable object
                const result = iteratorUtils.skip(input, 2);

                // ASSERT: the generator is of expected type and it manually iterates through sequence generating the expected array
                asserter.expectIsGeneratorWithDoneAwareManualIteration(result, ['s', 't']);
            });
        });
    });

    context('{ iteratorUtils.reiterable }', function () {
        context('when an iterable object is provided but a GENERATOR that is able to reiterate through the items multiple times in a circle is needed', function () {
            it('creates a generator that iterates through the given array', function () {
                // ARRANGE: the iterable object
                const input = ['t', 'e', 's', 't'];

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reiterable(input, 2);

                // ASSERT: the generator is of expected type and the iteration of it yields the items but twice in a row
                asserter.expectIsGeneratorWithOutput(result, ['t', 'e', 's', 't', 't', 'e', 's', 't']);
            });

            it('creates a generator that iterates through the given string', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reiterable(input, 2);

                // ASSERT: the generator is of expected type and the iteration of it yields the items but twice in a row
                asserter.expectIsGeneratorWithOutput(result, ['t', 'e', 's', 't', 't', 'e', 's', 't']);
            });

            it('creates a generator that iterates through the given generator', function () {
                // ARRANGE: the iterable object
                const input = (function *() {
                    yield 't';
                    yield 'e';
                    yield 's';
                    yield 't';
                })();

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reiterable(input, 2);

                // ASSERT: the generator is of expected type and the iteration of it yields the items but twice in a row
                asserter.expectIsGeneratorWithOutput(result, ['t', 'e', 's', 't', 't', 'e', 's', 't']);
            });
        });

        context('when an NON-iterable object is provided but a GENERATOR that is able to reiterate through the items multiple times in a circle is needed', function () {
            it('creates a generator that yields an empty set', function () {
                // ARRANGE: the NON-iterable object
                const input = null;

                // ACT: the generator that will create iterators given the NON-iterable object
                const result = iteratorUtils.reiterable(input, 2);

                // ASSERT: the generator is of expected type and the iteration of it yields the items but twice in a row
                asserter.expectIsGeneratorWithOutput(result, []);
            });
        });

        context('when an iterable object is provided but a GENERATOR is needed', function () {
            it('creates a generator that yields an empty set', function () {
                // ARRANGE: the iterable object
                const input = ['t', 'e', 's', 't'];

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reiterable(input, 1);

                // ASSERT: the generator is of expected type and the iteration of it yields the items but once
                asserter.expectIsGeneratorWithOutput(result, ['t', 'e', 's', 't']);
            });
        });

        context('when an iterable object is provided but an ITERATOR that is able to reiterate through the items multiple times in a circle is needed', function () {
            it('creates a generator that yields an iterator that reiterates through every item multiple times in a circle, but one by one', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the iterator for the given the iterable object
                const result = iteratorUtils.reiterable(input, 2);

                // ASSERT: the generator is of expected type and it manually iterates through sequence generating the expected array
                asserter.expectIsGeneratorWithDoneAwareManualIteration(result, ['t', 'e', 's', 't', 't', 'e', 's', 't']);
            });
        });
    });

    context('{ iteratorUtils.reverse }', function () {
        context('when an iterable object is provided but a GENERATOR that is able to iterate through the items but in reverse order is needed', function () {
            it('creates a generator that iterates through the given array', function () {
                // ARRANGE: the iterable object
                const input = ['t', 'e', 's', 't'];

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reverse(input);

                // ASSERT: the generator is of expected type and the iteration of it yields the items in reverse order
                asserter.expectIsGeneratorWithOutput(result, ['t', 's', 'e', 't']);
            });

            it('creates a generator that iterates through the given string', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reverse(input);

                // ASSERT: the generator is of expected type and the iteration of it yields the items in reverse order
                asserter.expectIsGeneratorWithOutput(result, ['t', 's', 'e', 't']);
            });

            it('creates a generator that iterates through the given generator', function () {
                // ARRANGE: the iterable object
                const input = (function *() {
                    yield 't';
                    yield 'e';
                    yield 's';
                    yield 't';
                })();

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reverse(input);

                // ASSERT: the generator is of expected type and the iteration of it yields the items in reverse order
                asserter.expectIsGeneratorWithOutput(result, ['t', 's', 'e', 't']);
            });
        });

        context('when an NON-iterable object is provided but a GENERATOR that is able to iterate through the items but in reverse order is needed', function () {
            it('creates a generator that yields an empty set', function () {
                // ARRANGE: the NON-iterable object
                const input = null;

                // ACT: the generator that will create iterators given the NON-iterable object
                const result = iteratorUtils.reverse(input);

                // ASSERT: the generator is of expected type and the iteration of it yields the items in reverse order
                asserter.expectIsGeneratorWithOutput(result, []);
            });
        });

        context('when an iterable object is provided but an ITERATOR that is able to iterate through the items but in reverse order is needed', function () {
            it('creates a generator that yields an iterator that iterates through the items but in reverse order, and one by one', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the iterator for the given the iterable object
                const result = iteratorUtils.reverse(input);

                // ASSERT: the generator is of expected type and it manually iterates through sequence generating the expected array
                asserter.expectIsGeneratorWithDoneAwareManualIteration(result, ['t', 's', 'e', 't']);
            });
        });
    });
});