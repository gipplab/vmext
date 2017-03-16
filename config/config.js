'use strict';

module.exports = {
  host: (process.env.NODE_ENV === 'production') ? 'math.citeplag.org' : `localhost:${process.env.PORT || '4001'}`,
  slack: {
    webhook: 'https://hooks.slack.com/services/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',
    channels: {
      exceptions: '#nodejs_exceptions'
    }
  },
  logs: {
    dir: '/logs',
    level: (process.env.NODE_ENV === 'production') ? 'info' : 'debug'
  },
};
