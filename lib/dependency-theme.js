var ThemingContext = require('./ThemingContext');
var fs = require('fs');

var logger = require('raptor-logging').logger(module);
var lessParser = require('./less-parser');
var nodePath = require('path');

function readThemeConfig(dependency, callback) {
    var filePath = dependency.path;

    fs.readFile(filePath, 'utf8', function(err, json) {
        if (err) {
            return callback(new Error('Theme does not exist: ' + filePath + ' (referenced in ' + dependency.getParentManifestPath() + ')'));
        }

        var parsed;

        try {
            parsed = JSON.parse(json);
        } catch(e) {
            return callback(new Error('Error parsing "' + filePath + '" (referenced in ' + dependency.getParentManifestPath() + '). ' + e));
        }

        return callback(null, parsed);
    });
}

module.exports = function create(config) {

    return {
        cache: false,

        properties: {
            path: 'string'
        },

        init: function(lassoContext, callback) {
            if (!lessParser.exists()) {
                return callback(new Error('Unable to handle themed Less dependency for path "' + this.path + '". The "less" module was not found. This module should be installed as a top-level application module.'));
            }

            this.path = this.requireResolvePath(this.path);
            callback();
        },

        getSourceFile: function() {
            return this.path;
        },

        read: function(lassoContext, callback) {
            var self = this;
            var themingContext = ThemingContext.getThemingContext(lassoContext);

            var infoEnabled = logger.isInfoEnabled();
            //var debugEnabled = logger.isDebugEnabled();

            if (infoEnabled) {
                logger.info('Compiling theme ' + this.path + '...');
            }

            readThemeConfig(this, function(err, themeConfig) {
                if (err) {

                    return callback(err);
                }

                var themedDependencies = themingContext.getThemedDependencies();

                if (infoEnabled) {
                    logger.info('Number of themed dependencies: ' + themedDependencies.length);
                }

                if (themedDependencies.length === 0) {
                    logger.warn('Theme ' + self.path + ' not compiled because there are no themed dependencies');
                    return callback(null, null);
                }

                var i;
                var lessCode = '';

                var imports = themingContext.getThemeImports();
                if (imports) {
                    for (i = 0; i < imports.length; i++) {
                        var themeImport = imports[i];
                        lessCode += '@import "' + themeImport.path + '";\n';
                    }
                }

                var from = nodePath.dirname(self.requireResolvePath(self.path));

                imports = themeConfig.imports;
                if (imports) {
                    for (i = 0; i < imports.length; i++) {
                        var absPath = self.requireResolvePath(imports[i], from);
                        lessCode += '@import "' + absPath + '";\n';
                    }
                }

                for (i = 0; i < themedDependencies.length; i++) {
                    var dependency = themedDependencies[i];
                    lessCode += '@import "' + dependency.path + '";\n';
                }

                lessParser.parse(self.path, lessCode, config, callback);
            });
        },

        calculateKey: function() {
            return this.path;
        }
    };
};
