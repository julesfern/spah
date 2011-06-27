// Module which auto-requires uncompiled source and produces exports

var fs = require('fs');
var sys = require('sys');

// Walk this dir for other JS files
var files = fs.readdirSync(__dirname);

for(var i in files) {
  sys.puts(i+": "+files[i]);
}
