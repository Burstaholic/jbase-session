// ---------------------------------------------------------------------------------------------------------------------
// Simple TrivialDB based session store
//
// @module trivialdb-session
// ---------------------------------------------------------------------------------------------------------------------

const trivialdb = require('trivialdb');
const _ = {
    get: require('lodash.get')
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = function(session)
{
    class TrivialDBSession extends session.Store
    {
        constructor(options)
        {
            options = options || {};
            super(options);

            let namespace = trivialdb;
            if(options.namespace)
            {
                namespace = trivialdb.ns(options.namespace, { basePath: options.basePath, dbPath: options.dbPath });
                delete options.basePath;
            } // end if

            this.SessionDB = namespace.db('sessions', options);
        } // end constructor

        get(sid, cb)
        {
            let session = this.SessionDB.get(sid);
            if(!session)
            {
                cb(new Error('Session ID not found: ' + sid));
            }
            else
            {
                const created = _.get(session, 'created', Date.now());
                const maxAge = _.get(session, 'data.cookie.maxAge', 0) * 1000;
                const expiration = created + maxAge;

                if(Date.now() >= expiration)
                {
                    // Delete the expired session, and then act like we didn't find it.
                    this.destroy(sid, () =>
                    {
                        cb(new Error('Session ID not found: ' + sid));
                    });
                }
                else
                {
                    cb(undefined, session.data);
                } // end if
            } // end if
        } // end get

        set(sid, sess, cb)
        {
            let session = this.SessionDB.get(sid);
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
            } // end if

            return this.SessionDB.save(sid, session, Date.now() + sess.cookie.maxAge * 1000)
                .asCallback(cb);
        } // end set

        destroy(sid, cb)
        {
            return this.SessionDB.remove({ id: sid })
                .asCallback(cb);
        } // end destroy
    } // end TrivialDBSession

    return TrivialDBSession;
};

// ---------------------------------------------------------------------------------------------------------------------
