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
            if (!lessParser.exists()) {
                return callback(new Error('Unable to handle themed Less dependency for path "' + this.path + '". The "less" module was not found. This module should be installed as a top-level application module.'));
            }

            this.resolvedPath = this.requireResolvePath(this.path);
            callback();
        },

        onAddToPageBundle: function(bundle, optimizerContext) {
            var themingContext = ThemingContext.getThemingContext(optimizerContext);
            themingContext.addThemeImport(this);

            if (logger.isDebugEnabled()) {
                logger.debug('Added theme import: ' + this.resolvedPath);
            }
        },

        onAddToAsyncPageBundle: function(bundle, optimizerContext) {
            var themingContext = ThemingContext.getThemingContext(optimizerContext);
            themingContext.addThemeImport(this);

            if (logger.isDebugEnabled()) {
                logger.debug('Added theme import: ' + this.resolvedPath);
            }
        },

        read: function(optimizerContext, callback) {
            return null;
        },

        calculateKey: function() {
            // use the absolute path to the imported resource as the key
            return this.resolvedPath;
        }
    };
};
