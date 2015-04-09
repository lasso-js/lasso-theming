var themedPrefixRegex = /^(themed|theme-import):[ ]*(.*)$/;

module.exports = function(lasso, config) {
    lasso.dependencies.registerStyleSheetType('theme', require('./lib/dependency-theme')(config));

    // a theme import is an import that gets included before all themed resources
    lasso.dependencies.registerType('theme-import', require('./lib/dependency-theme-import')(config));

    // A themed resource does produce output so it has no content type (contentType is 'none')
    lasso.dependencies.registerType('themed', require('./lib/dependency-themed')(config));

    lasso.dependencies.registerExtension('theme.json', 'theme');

    lasso.dependencies.addNormalizer(function(dependency) {
        if (dependency.constructor === String) {
            var match = themedPrefixRegex.exec(dependency);
            if (match) {
                return {
                    type: match[1],
                    path: match[2]
                };
            }
        }
    });
};