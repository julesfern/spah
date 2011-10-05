#!/usr/bin/env node

try {
    var reporter = require('nodeunit').reporters.default;
}
catch(e) {
    var util = require('util');
    util.puts("Cannot find nodeunit module.");
    util.puts("You can download submodules for this project by doing:");
    util.puts("");
    util.puts("    git submodule init");
    util.puts("    git submodule update");
    util.puts("");
    process.exit();
}

require(__dirname+"/../src/Spah.js");

// SpahQL

require(__dirname+"/../src/Spah.SpahQL.js");
require(__dirname+"/../src/Spah.SpahQL.Callbacks.js");
require(__dirname+"/../src/Spah.SpahQL.Errors.js");
require(__dirname+"/../src/Spah.SpahQL.Query.js");
require(__dirname+"/../src/Spah.SpahQL.QueryResult.js");
require(__dirname+"/../src/Spah.SpahQL.QueryResultSet.js");
require(__dirname+"/../src/Spah.SpahQL.QueryParser.js");
require(__dirname+"/../src/Spah.SpahQL.QueryRunner.js");
require(__dirname+"/../src/Spah.SpahQL.DataHelper.js");
require(__dirname+"/../src/Spah.SpahQL.Token.js");
require(__dirname+"/../src/Spah.SpahQL.Token.Base.js");
require(__dirname+"/../src/Spah.SpahQL.Token.Simple.js");
require(__dirname+"/../src/Spah.SpahQL.Token.String.js");
require(__dirname+"/../src/Spah.SpahQL.Token.Numeric.js");
require(__dirname+"/../src/Spah.SpahQL.Token.Boolean.js");
require(__dirname+"/../src/Spah.SpahQL.Token.Set.js");
require(__dirname+"/../src/Spah.SpahQL.Token.ComparisonOperator.js");
require(__dirname+"/../src/Spah.SpahQL.Token.FilterQuery.js");
require(__dirname+"/../src/Spah.SpahQL.Token.PathComponent.js");
require(__dirname+"/../src/Spah.SpahQL.Token.SelectionQuery.js");
require(__dirname+"/../src/Spah.SpahQL.Token.KeyName.js");

// DOM runner

require(__dirname+"/../src/Spah.DOM.Modifiers.js");
require(__dirname+"/../src/Spah.DOM.Document.js");
require(__dirname+"/../src/Spah.DOM.Blueprint.js");

process.chdir(__dirname);
reporter.run(['.']);