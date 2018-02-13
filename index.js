'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _operators = require('./lib/operators.mjs');

Object.keys(_operators).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _operators[key];
    }
  });
});

var _stream = require('./lib/stream.mjs');

Object.defineProperty(exports, 'stream', {
  enumerable: true,
  get: function () {
    return _stream.stream;
  }
});
Object.defineProperty(exports, 'from', {
  enumerable: true,
  get: function () {
    return _stream.toAsync;
  }
});