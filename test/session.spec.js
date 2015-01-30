// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the session.spec module.
//
// @module session.spec
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");
var exSession = require('express-session');
var jsession = require('../lib/jbase-session')(exSession);

// ---------------------------------------------------------------------------------------------------------------------

describe('The session handler:', function()
{
    var store;

    beforeEach(function()
    {
        store = new jsession({writeToDisk: false, loadFromDisk: false});
    });

    describe('Creation test',
        function()
        {
            it('stores and retrieves session', function(done)
            {
                store.set('123', {cookie: {maxAge: 2000, name: 'Bob'}})
                    .then(function()
                    {
                        return store.get('123')
                            .then(function(result)
                            {
                                assert.deepEqual({cookie: {maxAge: 2000, name: 'Bob'}}, result);
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
            store.get('123')
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
                .error(function()
                {
                    done();
                });
        });

        it('updates creation time on touch', function(done)
        {
            setTimeout(function()
            {
                var original = store.Session.filter({sessionID: '123'})
                    .get(0)
                    .then(function(r)
                    {
                        return r.created;
                    });

                original.then(function()
                {
                    store.touch('123', {cookie: {maxAge: 2000, name: 'Bob'}})
                        .then(function()
                        {
                            return store.Session.filter({sessionID: '123'})
                        })
                        .get(0)
                        .then(function(r)
                        {
                            if(r.created > original.value())
                            {
                                done();
                            }
                            else
                            {
                                done(new Error('Session age not updated!'));
                            }
                        })
                })
            }, 5);
        });

        it('gets the length of the session list', function(done)
        {
            store.length()
                .then(function(r)
                {
                    if(r == 1)
                    {
                        done();
                    }
                    else
                    {
                        done(new Error("Wrong session list length received!"));
                    }
                });
        });

        it('clears all sessions', function(done)
        {
            store.clear()
                .then(function()
                {
                    return store.length();
                })
                .then(function(r)
                {
                    if(r == 0)
                    {
                        done();
                    }
                    else
                    {
                        done(new Error("Sessions not cleared!"));
                    }
                })
        })
    });

    it('does not retrieve an expired session', function(done)
    {
        store.set('123', {cookie: {maxAge: 1, name: 'Bob'}});

        setTimeout(function(id)
        {
            store.get.apply(store, [id])
                .then(function()
                {
                    done(new Error("Session not destroyed!"));
                })
                .error(function()
                {
                    done();
                });
        }, 1001, '123');
    });
});

// ---------------------------------------------------------------------------------------------------------------------