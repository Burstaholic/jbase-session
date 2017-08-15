# TrivialDB Session Store

[![Build Status](https://img.shields.io/travis/trivialsoftware/trivialdb-session/master.svg)](https://travis-ci.org/trivialsoftware/trivialdb-session)
[![npm Version](https://img.shields.io/npm/v/trivialdb-session.svg)](https://www.npmjs.com/package/trivialdb-session)
![npm](https://img.shields.io/npm/dm/trivialdb-session.svg)
[![GitHub issues](https://img.shields.io/github/issues/trivialsoftware/trivialdb-session.svg)](https://github.com/trivialsoftware/trivialdb-session/issues)
[![Donate $5](https://img.shields.io/badge/Donate-%245-yellow.svg)](https://paypal.me/morgul/5)

TrivialDB-backed session store for Express and Connect

## Usage

```javascript
const session = require('express-session');
const TrivialStore = require('trivialdb-session')(session);

app.use(session({
    store: new TrivialStore({ namespace: 'some-ns', prettyPrint: true }),
    secret: 'keyboard cat'
}));

```

### Options

Supports all the same options as [TrivialDB][tdb].

[tdb]: https://github.com/trivialsoftware/trivialdb#trivialdb-api
