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
            created: { type: Number, required: true },
            maxAge: { type: Number },
            data: { type: Object }
        }, options);
    } // end JBaseSession

    util.inherits(JBaseSession, session.Store);

    JBaseSession.prototype.get = function(sid, cb)
    {
        var self = this;
        return this.Session.filter({ sessionID: sid })
            .get(0)
            .then(function(result)
            {
                if(!result)
                {
                    return jbase.Promise.reject(new Error('Session ID not found: ' + sid));
                }
                else if (Date.now() - result.created > (result.maxAge * 1000))
                {
                    return self.destroy(sid)
                        .then(function()
                        {
                            return jbase.Promise.reject(new Error('Session ID not found: ' + sid));
                        });
                } // end if

                return result.data;
            }) // end then
            .nodeify(cb);
    }; // end get

    JBaseSession.prototype.set = function(sid, sess, cb)
    {
        var self = this;
        return this.Session.filter({sessionID: sid})
            .get(0)
            .then(function(result)
            {
                if(result)
                {
                    result.data = sess;
                    result.created = Date.now();
                    result.save()
                        .nodeify(cb);
                }
                else
                {
                    var newSess = new self.Session({
                        sessionID: sid,
                        created: Date.now(),
                        maxAge: sess.cookie.maxAge,
                        data: sess
                    });

                    newSess.save()
                        .nodeify(cb);
                } // end if
            }); // end then
    }; // end set

    JBaseSession.prototype.destroy = function(sid, cb)
    {
        return this.Session.remove({sessionID: sid}).nodeify(cb);
    }; // end destroy

    JBaseSession.prototype.touch = function(sid, sess, cb)
    {
        return this.set(sid, sess, cb);
    };

    JBaseSession.prototype.length = function(cb)
    {
        return this.Session.filter()
            .then(function(r)
            {
                return r.length;
            })
            .nodeify(cb);
    };

    JBaseSession.prototype.clear = function(cb)
    {
        return this.Session.removeAll().nodeify(cb);
    };

    return JBaseSession;
}; // end export function

// ---------------------------------------------------------------------------------------------------------------------