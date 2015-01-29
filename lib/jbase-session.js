// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of jbase-session.
//
// @module jbase-session
// ---------------------------------------------------------------------------------------------------------------------

var jbase = require('jbase');
var util = require('util');

module.exports = function(session)
{
    function JBaseSession()
    {
        this.Session = jbase.defineModel('sessions', {
            sessionID: { type: String, required: true },
            created: { type: Date, required: true },
            maxAge: { type: Number },
            data: { type: Object }
        });
    }

    util.inherits(JBaseSession, session.Store);

    // TODO: Implement aging out sessions
    JBaseSession.prototype.get = function(sid, cb)
    {
        this.Session.filter({ sessionID: sid })
            .spread(function(result)
            {
                if(result)
                {
                    cb(null, result.data);
                }
                else
                {
                    cb('No session found with id: ' + sid);
                }
            })
            .catch(function(err)
            {
                cb(err);
            });
    };

    JBaseSession.prototype.set = function(sid, sess, cb)
    {
        this.Session.filter({sessionID: sid})
            .spread(function(result)
            {
                if(result)
                {
                    result.data = sess;
                    result.created = new Date();
                    result.save()
                        .nodeify(cb);
                }
                else
                {
                    var newSess = new Session({
                        sessionID: sid,
                        created: new Date(),
                        maxAge: sess.cookie.maxAge,
                        data: sess
                    });

                    newSess.save()
                        .nodeify(cb);
                }
            });
    };

    JBaseSession.prototype.destroy = function(sid, cb)
    {
        this.Session.filter({sessionID: sid})
            .spread(function(result)
            {
                if(result)
                {
                    result.remove()
                        .nodeify(cb);
                }
                else
                {
                    cb('No session found with id: ' + sid);
                }
            });
    };

    return JBaseSession;
};

// ---------------------------------------------------------------------------------------------------------------------