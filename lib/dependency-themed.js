var ThemingContext = require('./ThemingContext');
var lessParser = require('./less-parser');
var logger = require('raptor-logging').logger(module);

module.exports = function create(config) {

    return {
        properties: {
            path: 'string'
        },

        // we don't actually produce JavaScript or CSS
        contentType: 'none',

        init: function(optimizerContext, callback) {
            this.path = this.resolvePath(this.path);

            if (!lessParser.exists()) {
                return callback(new Error('Unable to handle themed Less dependency for path "' + this.path + '". The "less" module was not found. This module should be installed as a top-level application module.'));
            }
            callback();
        },

        onAddToPageBundle: function(bundle, optimizerContext) {
            var themingContext = ThemingContext.getThemingContext(optimizerContext);
            themingContext.addThemedDependency(this);

            if (logger.isDebugEnabled()) {
                logger.debug('Added themed dependency: ' + this.path);
            }
        },

        onAddToAsyncPageBundle: function(bundle, optimizerContext) {
            var themingContext = ThemingContext.getThemingContext(optimizerContext);
            themingContext.addThemedDependency(this);

            if (logger.isDebugEnabled()) {
                logger.debug('Added themed dependency: ' + this.path);
            }
        },

        read: function(optimizerContext, callback) {
            return null;
        },

        calculateKey: function() {
            return this.path;
        }
    };
};
