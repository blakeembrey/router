var pathToRegexp = require('path-to-regexp')

module.exports = pathRegexp

function pathRegexp (path, options) {
  // fast path non-ending match for / (everything matches)
  if (path === '/' && options.end === false) {
    return fast_slash
  }

  var keys = []
  var regexp = pathToRegexp(path, keys, options)

  return function (pathname) {
    var m = regexp.exec(pathname)

    if (!m) {
      return false
    }

    // store values
    var path = m[0]
    var params = {}
    var prop
    var n = 0
    var key
    var val

    for (var i = 1, len = m.length; i < len; ++i) {
      key = keys[i - 1]
      prop = key
        ? key.name
        : n++
      val = decode_param(m[i])

      if (val !== undefined || !(hasOwnProperty.call(params, prop))) {
        params[prop] = val
      }
    }

    return { path: path, params: params }
  }

}

/**
 * Decode param value.
 *
 * @param {string} val
 * @return {string}
 * @api private
 */

function decode_param(val){
  if (typeof val !== 'string') {
    return val
  }

  try {
    return decodeURIComponent(val)
  } catch (e) {
    var err = new TypeError("Failed to decode param '" + val + "'")
    err.status = 400
    throw err
  }
}

/**
 * Always return true.
 */

function fast_slash () {
  return { path: '' }
}
