'use strict';

const { expect } = require('chai');

describe('{ iteratorUtils } provides functionality that extends behavior for generators (a.k.a. iterator factories)', function () {
    const iteratorUtils = require('./iterator-utils.js');

    context('{ iteratorUtils.default }', function () {
        context('when an iterable object is provided but a generator is needed', function () {
            it('creates an instance of a generator that will iterate through the given array', function () {
                // ARRANGE: the iterable object
                const input = ['t', 'e', 's', 't'];

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.default(input);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration of the generator is the original iterable
                expect(Array.from(result)).to.eql(['t', 'e', 's', 't']);
            });

            it('creates an instance of a generator that will iterate through the given string', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.default(input);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration of the generator is the original iterable
                expect(Array.from(result)).to.eql(['t', 'e', 's', 't']);
            });

            it('creates an instance of a generator that will iterate through the given generator', function () {
                // ARRANGE: the iterable object
                const input = (function *() {
                    yield 't';
                    yield 'e';
                    yield 's';
                    yield 't';
                })();

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.default(input);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration of the generator is the original iterable
                expect(Array.from(result)).to.eql(['t', 'e', 's', 't']);
            });
        });

        context('when an NON-iterable object is provided but a generator is needed', function () {
            it('creates a generator that yields an empty set when the input is a null pointer', function () {
                // ARRANGE: the NON-iterable object
                const input = null;

                // ACT: the generator that will create iterators given the NON-iterable object
                const result = iteratorUtils.default(input);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: an empty iteration
                expect(Array.from(result)).to.eql([]);
            });
        });
    });

    context('{ iteratorUtils.skip }', function () {
        context('when an iterable object is provided but a generator that is able to skip some of the items is needed', function () {
            it('creates an instance of a generator that will iterate through the given array', function () {
                // ARRANGE: the iterable object
                const input = ['t', 'e', 's', 't'];

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.skip(input, 2);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration the generator yields which only includes the items that were not skipped
                expect(Array.from(result)).to.eql(['s', 't']);
            });

            it('creates an instance of a generator that will iterate through the given string', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.skip(input, 2);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration the generator yields which only includes the items that were not skipped
                expect(Array.from(result)).to.eql(['s', 't']);
            });

            it('creates an instance of a generator that will iterate through the given generator', function () {
                // ARRANGE: the iterable object
                const input = (function *() {
                    yield 't';
                    yield 'e';
                    yield 's';
                    yield 't';
                })();

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.skip(input, 2);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration the generator yields which only includes the items that were not skipped
                expect(Array.from(result)).to.eql(['s', 't']);
            });
        });

        context('when an NON-iterable object is provided but a generator that is able to skip some of the items is needed', function () {
            it('creates a generator that yields an empty set when the input is a null pointer', function () {
                // ARRANGE: the NON-iterable object
                const input = null;

                // ACT: the generator that will create iterators given the NON-iterable object
                const result = iteratorUtils.skip(input, 2);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: an empty iteration
                expect(Array.from(result)).to.eql([]);
            });
        });

        context('when an iterable object is provided but a generator that is able to skip all of the items is needed', function () {
            it('creates an instance of a generator that will iterate through the given generator', function () {
                // ARRANGE: the iterable object
                const input = (function *() {
                    yield 't';
                    yield 'e';
                    yield 's';
                    yield 't';
                })();

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.skip(input, 5);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration the generator yields which only includes the items that were not skipped
                expect(Array.from(result)).to.eql([]);
            });
        });
    });

    context('{ iteratorUtils.reiterable }', function () {
        context('when an iterable object is provided but a generator that is able to reiterate all of the items is needed', function () {
            it('creates an instance of a generator that will iterate through the given array', function () {
                // ARRANGE: the iterable object
                const input = ['t', 'e', 's', 't'];

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reiterable(input, 2);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration the generator yields which is the original iterable but twice in a row
                expect(Array.from(result)).to.eql(['t', 'e', 's', 't', 't', 'e', 's', 't']);
            });

            it('creates an instance of a generator that will iterate through the given string', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reiterable(input, 2);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration the generator yields which is the original iterable but twice in a row
                expect(Array.from(result)).to.eql(['t', 'e', 's', 't', 't', 'e', 's', 't']);
            });

            it('creates an instance of a generator that will iterate through the given generator', function () {
                // ARRANGE: the iterable object
                const input = (function *() {
                    yield 't';
                    yield 'e';
                    yield 's';
                    yield 't';
                })();

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reiterable(input, 2);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration the generator yields which is the original iterable but twice in a row
                expect(Array.from(result)).to.eql(['t', 'e', 's', 't', 't', 'e', 's', 't']);
            });
        });

        context('when a NON-iterable object is provided but a generator that is able to reiterate all of the items is needed', function () {
            it('creates a generator that yields an empty set when the input is a null pointer', function () {
                // ARRANGE: the NON-iterable object
                const input = null;

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reiterable(input, 2);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: an empty iteration
                expect(Array.from(result)).to.eql([]);
            });
        });

        context('when an iterable object is provided but a generator that is able to iterate through all the items only once is needed', function () {
            it('creates an instance of a generator that will iterate through the given array', function () {
                // ARRANGE: the iterable object
                const input = ['t', 'e', 's', 't'];

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reiterable(input, 1);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration the generator yields which is the original iterable but twice in a row
                expect(Array.from(result)).to.eql(['t', 'e', 's', 't']);
            });
        });
    });

    context('{ iteratorUtils.reverse }', function () {
        context('when an iterable object is provided but a generator that is able to iterate through the items backwards is needed', function () {
            it('creates an instance of a generator that will iterate through the given array', function () {
                // ARRANGE: the iterable object
                const input = ['t', 'e', 's', 't'];

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reverse(input);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration the generator yields which is the original iterable but backwards
                expect(Array.from(result)).to.eql(['t', 's', 'e', 't']);
            });

            it('creates an instance of a generator that will iterate through the given string', function () {
                // ARRANGE: the iterable object
                const input = 'test';

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reverse(input);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration the generator yields which is the original iterable but backwards
                expect(Array.from(result)).to.eql(['t', 's', 'e', 't']);
            });

            it('creates an instance of a generator that will iterate through the given generator', function () {
                // ARRANGE: the iterable object
                const input = (function *() {
                    yield 't';
                    yield 'e';
                    yield 's';
                    yield 't';
                })();

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reverse(input);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: the iteration the generator yields which is the original iterable but backwards
                expect(Array.from(result)).to.eql(['t', 's', 'e', 't']);
            });
        });

        context('when a NON-iterable object is provided but a generator that is able to iterate through the items backwards is needed', function () {
            it('creates a generator that yields an empty set when the input is a null pointer', function () {
                // ARRANGE: the NON-iterable object
                const input = null;

                // ACT: the generator that will create iterators given the iterable object
                const result = iteratorUtils.reverse(input);

                // ASSERT: the result is an instance of a generator
                expect(result).to.satisfy(r => Symbol.iterator in r);
                // ASSERT: an empty iteration
                expect(Array.from(result)).to.eql([]);
            });
        });
    });
});