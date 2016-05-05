// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the session.spec module.
//
// @module session.spec
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");
var exSession = require('express-session');
var tsession = require('../lib/trivialdb-session')(exSession);

// ---------------------------------------------------------------------------------------------------------------------

describe('Test session handling', function()
{
    var store;

    beforeEach(function()
    {
        store = new tsession({writeToDisk: false, loadFromDisk: false});
    });

    describe('Creation test',
        function()
        {
            it('stores and retrieves session', function(done)
            {
                store.set('123', {cookie: {maxAge: 2000, name: 'Bob'}}, function()
                {
                    store.get('123', function(error, result)
                    {
                        assert.deepEqual({cookie: {maxAge: 2000, name: 'Bob'}}, result);
                        done();
                    });
                });
            })
        });

    describe('Operation tests', function()
    {
        beforeEach(function(done)
        {
            store.set('123', {cookie: {maxAge: 2000, name: 'Bob'}}, done);
        });

        it('retrieves a stored session', function()
        {
            store.get('123', function(error, result)
            {
                assert.deepEqual({cookie: {maxAge: 2000, name: 'Bob'}}, result);
            });
        });

        it('destroys a stored session', function(done)
        {
            store.destroy('123', function()
            {
                store.get('123', function(error, result)
                {
                    assert.strictEqual(result, undefined, "Session not destroyed!");
                    done();
                });
            });
        });
    });

    it('does not retrieve an expired session', function(done)
    {
        store.set('123', {cookie: {maxAge: 1, name: 'Bob'}}, function()
        {
            setTimeout(function()
            {
                store.get('123', function(error, result)
                {
                    assert.strictEqual(result, undefined, "Session not destroyed!");
                    done();
                });
            }, 1001);
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------