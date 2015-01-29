// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the session.spec module.
//
// @module session.spec
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");
var exSession = require('express-session');
var jsession = require('../lib/jbase-session')(exSession);
var Promise = require('bluebird');

// ---------------------------------------------------------------------------------------------------------------------

describe('Test session handling', function()
{
    var store;

    beforeEach(function()
    {
        store = new jsession({writeToDisk: false, loadFromDisk: false});
        Promise.promisifyAll(store);
    });

    describe('Creation test',
        function()
        {
            it('stores and retrieves session', function(done)
            {
                store.setAsync('123', {cookie: {maxAge: 2000, name: 'Bob'}})
                    .then(function(s)
                    {
                        return store.getAsync('123')
                            .then(function(result)
                            {
                                assert.deepEqual(s.data, result);
                            });
                    })
                    .then(done, done);
            })
        });

    describe('Operation tests', function()
    {
        beforeEach(function()
        {
            store.set('123', {cookie: {maxAge: 2000, name: 'Bob'}});
        });

        it('retrieves a stored session', function(done)
        {
            store.getAsync('123')
                .then(function(result)
                {
                    assert.deepEqual({cookie: {maxAge: 2000, name: 'Bob'}}, result);
                })
                .then(done, done);
        });

        it('destroys a stored session', function(done)
        {
            store.destroy('123')
                .then(function()
                {
                    return store.get('123');
                })
                .then(function()
                {
                    done(new Error("Session not destroyed!"));
                })
                .error(function(e)
                {
                    done();
                });
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------