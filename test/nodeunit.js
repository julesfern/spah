#!/usr/bin/env node

require.paths.unshift(__dirname + '/dependency');
require.paths.unshift(__dirname + '/../src');

try {
    var reporter = require('nodeunit').reporters.default;
}
catch(e) {
    var sys = require('sys');
    sys.puts("Cannot find nodeunit module.");
    sys.puts("You can download submodules for this project by doing:");
    sys.puts("");
    sys.puts("    git submodule init");
    sys.puts("    git submodule update");
    sys.puts("");
    process.exit();
}

require("Spah.js");
require("Spah.SpahQL.js");
require("Spah.SpahQL.Errors.js");
require("Spah.SpahQL.Query.js");
require("Spah.SpahQL.QueryResult.js");
require("Spah.SpahQL.QueryParser.js");
require("Spah.SpahQL.QueryRunner.js");
require("Spah.SpahQL.DataHelper.js");
require("Spah.SpahQL.Token.js");
require("Spah.SpahQL.Token.Base.js");
require("Spah.SpahQL.Token.Simple.js");
require("Spah.SpahQL.Token.String.js");
require("Spah.SpahQL.Token.Numeric.js");
require("Spah.SpahQL.Token.Boolean.js");
require("Spah.SpahQL.Token.Set.js");
require("Spah.SpahQL.Token.ComparisonOperator.js");
require("Spah.SpahQL.Token.FilterQuery.js");
require("Spah.SpahQL.Token.PathComponent.js");
require("Spah.SpahQL.Token.SelectionQuery.js");
require("Spah.SpahQL.Token.KeyName.js");

process.chdir(__dirname);
reporter.run(['.']);