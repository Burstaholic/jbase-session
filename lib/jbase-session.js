// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of jbase-session.
//
// @module jbase-session
// ---------------------------------------------------------------------------------------------------------------------

var jbase = require('jbase');
var util = require('util');

module.exports = function(session)
{
    function JBaseSession ()
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
    JBaseSession.prototype.get = function (sid, cb)
    {
        this.Session.filter({ sessionID: sid })
            .then(function(result)
            {
                return cb(null, result.data);
            })
            .catch(function(err)
            {
                return cb(err);
            });
    };

    return JBaseSession;
};

// ---------------------------------------------------------------------------------------------------------------------