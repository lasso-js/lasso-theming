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

        init: function(lassoContext, callback) {
            if (!lessParser.exists()) {
                return callback(new Error('Unable to handle themed Less dependency for path "' + this.path + '". The "less" module was not found. This module should be installed as a top-level application module.'));
            }

            this.path = this.requireResolvePath(this.path);
            callback();
        },

        onAddToPageBundle: function(bundle, lassoContext) {
            var themingContext = ThemingContext.getThemingContext(lassoContext);
            themingContext.addThemeImport(this);

            if (logger.isDebugEnabled()) {
                logger.debug('Added theme import: ' + this.path);
            }
        },

        onAddToAsyncPageBundle: function(bundle, lassoContext) {
            var themingContext = ThemingContext.getThemingContext(lassoContext);
            themingContext.addThemeImport(this);

            if (logger.isDebugEnabled()) {
                logger.debug('Added theme import: ' + this.path);
            }
        },

        read: function(lassoContext, callback) {
            return null;
        },

        calculateKey: function() {
            // use the absolute path to the imported resource as the key
            return this.path;
        }
    };
};
