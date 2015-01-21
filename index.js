/**
 * Module dependencies.
 * @private
 */

var methods = require('methods')
var flatten = require('array-flatten')
var Engine = require('./engine')
var pathToRegexp = require('./lib/path-to-regexp')

/**
 * Module variables.
 * @private
 */

var slice = Array.prototype.slice

/**
 * Expose `Router`.
 */

module.exports = Router

/**
 * Expose `Route`.
 */

module.exports.Route = Engine.Route

/**
 * Construct a router instance.
 */

function Router (options) {
  if (!(this instanceof Router)) {
    return new Router(opts)
  }

  var opts = options || {}
  var router = Engine.call(this, opts)

  router.strict = opts.strict
  router.caseSensitive = opts.caseSensitive

  return router
}

/**
 * Inherits from the router engine.
 */

Router.prototype = Object.create(Engine.prototype)

/**
 * Create a `path-to-regexp` compatible `.use`.
 */

Router.prototype.use = function use(handler) {
  var offset = 0
  var path = '/'

  // default path to '/'
  // disambiguate router.use([handler])
  if (handler != null && typeof handler !== 'function') {
    var arg = handler

    while (Array.isArray(arg) && arg.length !== 0) {
      arg = arg[0]
    }

    // first arg is the path
    if (typeof arg !== 'function') {
      offset = 1
      path = handler
    }
  }

  var callbacks = flatten(slice.call(arguments, offset))

  var match = pathToRegexp(path, {
    sensitive: this.caseSensitive,
    strict: false,
    end: false
  })

  return Engine.prototype.use.call(this, path, match, callbacks)
}

/**
 * Create a `path-to-regexp` compatible route.
 */

Router.prototype.route = function route(path) {
  var match = pathToRegexp(path, {
    sensitive: this.caseSensitive,
    strict: this.strict,
    end: true
  })

  return Engine.prototype.route.call(this, path, match)
}

// create Router#VERB functions
methods.concat('all').forEach(function (method) {
  Router.prototype[method] = function (path) {
    var route = this.route(path)
    route[method].apply(route, slice.call(arguments, 1))
    return this
  }
})
