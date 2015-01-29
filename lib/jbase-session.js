// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of jbase-session.
//
// @module jbase-session
// ---------------------------------------------------------------------------------------------------------------------

var jbase = require('jbase');
var util = require('util');

module.exports = function(session)
{
    function JBaseSession(options)
    {
        options = options || {};

        this.Session = jbase.defineModel('sessions', {
            sessionID: { type: String, required: true },
            created: { type: Date, required: true },
            maxAge: { type: Number },
            data: { type: Object }
        }, options);
    }

    util.inherits(JBaseSession, session.Store);

    // TODO: Implement aging out sessions
    JBaseSession.prototype.get = function(sid, cb)
    {
        return this.Session.filter({ sessionID: sid })
            .spread(function(result)
            {
                if(!result)
                {
                    return jbase.Promise.reject(new Error('Not Found'));
                }
                return result.data;
            })
            .nodeify(cb);
    };

    JBaseSession.prototype.set = function(sid, sess, cb)
    {
        var self = this;
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
                    var newSess = new self.Session({
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
        return this.Session.remove({sessionID: sid}).nodeify(cb);
    };

    return JBaseSession;
};

// ---------------------------------------------------------------------------------------------------------------------