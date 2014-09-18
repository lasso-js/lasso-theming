var ThemingContext = require('./ThemingContext');
var nodePath = require('path');
var fs = require('fs');

var logger = require('raptor-logging').logger(module);
var lessParser = require('./less-parser');

function readThemeConfig(dependency, callback) {
    var filePath = dependency.path;
    var resolvedPath = dependency.resolvePath(filePath);

    fs.readFile(resolvedPath, 'utf8', function(err, json) {
        if (err) {
            return callback(new Error('Theme does not exist: ' + filePath + ' (referenced in ' + dependency.getParentManifestPath() + ')'));
        }

        try {
            return callback(null, JSON.parse(json));
        } catch(e) {
            return callback(new Error('Error parsing "' + filePath + '" (referenced in ' + dependency.getParentManifestPath() + '). ' + e));
        }
    });
}

module.exports = function create(config) {

    return {
        cache: false,
        
        properties: {
            path: 'string'
        },

        init: function(optimizerContext, callback) {
            if (!lessParser.exists()) {
                return callback(new Error('Unable to handle themed Less dependency for path "' + this.path + '". The "less" module was not found. This module should be installed as a top-level application module.'));
            }

            this.resolvedPath = this.resolvePath(this.path);
            callback();
        },

        getSourceFile: function() {
            return this.resolvedPath;
        },

        read: function(optimizerContext, callback) {
            var self = this;
            var themingContext = ThemingContext.getThemingContext(optimizerContext);

            var infoEnabled = logger.isInfoEnabled();
            //var debugEnabled = logger.isDebugEnabled();

            if (infoEnabled) {
                logger.info('Compiling theme ' + this.resolvedPath + '...');
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
                    logger.warn('Theme ' + self.resolvedPath + ' not compiled because there are no themed dependencies');
                    return callback(null, null);
                }

                var i;
                var lessCode = '';

                var imports = themingContext.getThemeImports();
                if (imports) {
                    for (i = 0; i < imports.length; i++) {
                        var themeImport = imports[i];
                        lessCode += '@import "' + themeImport.resolvedPath + '";\n';
                    }
                }

                imports = themeConfig.imports;
                if (imports) {
                    var dirname = nodePath.dirname(self.resolvedPath);
                    for (i = 0; i < imports.length; i++) {
                        var absPath = nodePath.resolve(dirname, imports[i]);
                        // if (!optimizerContext.cachingFs.existsSync(absPath)) {
                        //     return callback(err, 'Theme import "' + )
                        // }
                        lessCode += '@import "' + absPath + '";\n';
                    }
                }

                for (i = 0; i < themedDependencies.length; i++) {
                    var dependency = themedDependencies[i];
                    lessCode += '@import "' + dependency.path + '";\n';
                }

                lessParser.parse(self.resolvedPath, lessCode, config, callback);
            });
        },

        calculateKey: function() {
            return this.resolvedPath;
        }
    };
};
