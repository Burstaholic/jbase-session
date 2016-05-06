// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of trivialdb-session.
//
// @module trivialdb-session
// ---------------------------------------------------------------------------------------------------------------------

var trivialdb = require('trivialdb');
var util = require('util');

module.exports = function(session)
{
    function TrivialDBSession(options)
    {
        options = options || {};

        this.SessionDB = trivialdb.db('sessions', options);
    }

    util.inherits(TrivialDBSession, session.Store);

    TrivialDBSession.prototype.get = function(sid, cb)
    {
        var session = this.SessionDB.get(sid);
        if(!session)
        {
            cb(new Error('Session ID not found: ' + sid));
            return;
        }
        cb(undefined, session.data);
    };

    TrivialDBSession.prototype.set = function(sid, sess, cb)
    {
        var session = this.SessionDB.get(sid);
        if(session)
        {
            session.data = sess;
            session.created = Date.now();
        }
        else
        {
            session = {
                sessionID: sid,
                created: Date.now(),
                data: sess
            };
        }

        return this.SessionDB.save(sid, session, Date.now() + sess.cookie.maxAge * 1000)
            .asCallback(cb);
    };

    TrivialDBSession.prototype.destroy = function(sid, cb)
    {
        return this.SessionDB.remove({ id: sid })
            .asCallback(cb);
    };

    return TrivialDBSession;
};

// ---------------------------------------------------------------------------------------------------------------------