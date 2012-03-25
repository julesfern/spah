exports["Spah.SpahQL"] = {

	"Initialises with an array of results as an enumerable": function(test) {
		var s = new Spah.SpahQL(["a", "b"]);

		test.expect(7);
		test.equal(s[0], "a");
		test.equal(s[1], "b");
		test.equal(s.length, 2);

		for(var i=0; i<s.length; i++) test.equal(
			s[i], ((i==0)? "a" : "b")
		)

		test.ok(s instanceof Array);
		test.ok(s instanceof Spah.SpahQL);

		test.done();
	},

	"Initialises ok with an empty set": function(test) {
		var empties = [[], null, undefined];
		for(var i in empties) {
			var s = new Spah.SpahQL(empties[i]);
			test.ok(s);
			test.equal(s.length, 0);
			test.equal(s[0], undefined);
		}

		s = new Spah.SpahQL();
		test.ok(s);
		test.equal(s.length, 0);
		test.equal(s[0], undefined);

		test.done();
	},

	"Initialises a SpahQL DB": function(test) {
		var data = {"foo": "bar"};
		var s = Spah.SpahQL.db(data);
	
		test.equal(s.length, 1);
		test.ok(s.item(0));
		test.equal(s.item(0).path(), "/")
		test.deepEqual(s.item(0).value(), data);
		test.deepEqual(s.sourceData(), data);
		test.done(); 
	},

	"first() returns a new SpahQL with only one item": function(test) {
		var d1 = {path: "/1", value: "bar1"},
				d2 = {path: "/2", value: "bar2"},
				d3 = {path: "/3", value: "bar3"};
		var s = new Spah.SpahQL(d1, d2, d3);

		test.equal(3, s.length);

		var f = s.first();

		test.equal(1, f.length);
		test.equal(f.path(), "/1");
		test.equal(f.value(), "bar1");
		test.done();
	},

	"last() returns a new SpahQL with only one item": function(test) {
		var d1 = {path: "/1", value: "bar1"},
				d2 = {path: "/2", value: "bar2"},
				d3 = {path: "/3", value: "bar3"};
		var s = new Spah.SpahQL(d1, d2, d3);

		test.equal(3, s.length);

		var f = s.last();

		test.equal(1, f.length);
		test.equal(f.path(), "/3");
		test.equal(f.value(), "bar3");
		test.done();
	},

	"path() returns the path for the first item in the set": function(test) {
		var d1 = {path: "/1", value: "bar1"},
				d2 = {path: "/2", value: "bar2"},
				d3 = {path: "/3", value: "bar3"};
		var s = new Spah.SpahQL(d1, d2, d3);
		test.equal(s.path(), "/1");
		test.done();
	},

	"path() returns null for an empty set": function(test) {
		var s = new Spah.SpahQL();
		test.equal(s.path(), null);
		test.done();
	},

	"paths() returns all paths in the set": function(test) {
		var d1 = {path: "/1", value: "bar1"},
				d2 = {path: "/2", value: "bar2"},
				d3 = {path: "/3", value: "bar3"};
		var s = new Spah.SpahQL(d1, d2, d3);
		test.deepEqual(s.paths(), ["/1", "/2", "/3"]);
		test.done();
	},

	"paths() returns an empty array for an empty set": function(test) {
		var s = new Spah.SpahQL();
		test.deepEqual(s.paths(), []);
		test.done();
	},

	"value() returns the value for the first item in the set": function(test) {
		var d1 = {path: "/1", value: "bar1"},
				d2 = {path: "/2", value: "bar2"},
				d3 = {path: "/3", value: "bar3"};
		var s = new Spah.SpahQL(d1, d2, d3);
		test.equal(s.value(), "bar1");
		test.done();
	},

	"value() returns null for an empty set": function(test) {
		var s = new Spah.SpahQL();
		test.equal(s.value(), null);
		test.done();
	},

	"values() returns an array of all values in the set": function(test) {
		var d1 = {path: "/1", value: "bar1"},
				d2 = {path: "/2", value: "bar2"},
				d3 = {path: "/3", value: "bar3"};
		var s = new Spah.SpahQL(d1, d2, d3);
		test.deepEqual(s.values(), ["bar1", "bar2", "bar3"]);
		test.done();
	},

	"values() returns an empty array for an empty set": function(test) {
		var s = new Spah.SpahQL();
		test.deepEqual(s.values(), []);
		test.done();
	},

	"each() loops all objects and returns self": function(test) {
		var d1 = {path: "/1", value: "bar1"},
				d2 = {path: "/2", value: "bar2"},
				d3 = {path: "/3", value: "bar3"};
		var s = new Spah.SpahQL(d1, d2, d3);

		test.expect(7);

		var bar1Looped = 0,
				bar2Looped = 0,
				bar3Looped = 0;

		var res = s.each(function(i, total) {
			if(this.path() == "/1") {
				bar1Looped++;
				test.equal(this.value(), "bar1");
			}
			else if(this.path() == "/2") {
				bar2Looped++;
				test.equal(this.value(), "bar2");	
			}
			else {
				bar3Looped++;
				test.equal(this.value(), "bar3");
			}
		});

		test.deepEqual(res, s);
		test.equal(bar1Looped, 1);
		test.equal(bar2Looped, 1);
		test.equal(bar3Looped, 1);
		test.done();
	},

	"each() breaks when the callback returns false, but still returns self": function(test) {
		var d1 = {path: "/1", value: "bar1"},
				d2 = {path: "/2", value: "bar2"},
				d3 = {path: "/3", value: "bar3"};
		var s = new Spah.SpahQL(d1, d2, d3);

		test.expect(6);

		var bar1Looped = 0,
				bar2Looped = 0,
				bar3Looped = 0;

		var res = s.each(function(i, total) {
			if(this.path() == "/1") {
				bar1Looped++;
				test.equal(this.value(), "bar1");
			}
			else if(this.path() == "/2") {
				bar2Looped++;
				test.equal(this.value(), "bar2");
				return false;	
			}
			else {
				bar3Looped++;
			}
		});

		test.deepEqual(res, s);
		test.equal(bar1Looped, 1);
		test.equal(bar2Looped, 1);
		test.equal(bar3Looped, 0);
		test.done();
	},

	"map() successfully maps a set": function(test) {
		var d1 = {path: "/1", value: "bar1"},
				d2 = {path: "/2", value: "bar2"},
				d3 = {path: "/3", value: "bar3"};
		var s = new Spah.SpahQL(d1, d2, d3);

		var res = s.map(function(i, total) {
			return this.path();
		});

		test.deepEqual(res, ["/1", "/2", "/3"]);
		test.done();
	},

	"map() returns an empty array for an empty set": function(test) {
		var s = new Spah.SpahQL();

		var res = s.map(function(i, total) {
			return this.path();
		});

		test.deepEqual(res, []);
		test.done();
	},

	"select() retrieves matching results from all items in the set": function(test) {
		var data = {a: {aa: "aaval", ab: "abval", c: {inner: "accval"}}, b: {bb: "bbval", bc: "bcval", c: {inner: "bccval"}}}
		var db = Spah.SpahQL.db(data);

		var res = db.select("//c");

		test.equal(res.length, 2);
		test.deepEqual(res.paths(), ["/a/c", "/b/c"]);

		var inners = res.select("/inner");
		test.equal(inners.length, 2);
		test.deepEqual(inners.paths(), ["/a/c/inner", "/b/c/inner"]);
		test.deepEqual(inners.values(), ["accval", "bccval"]);

		test.done();
	},

	"assert() passes if all results match the assertion": function(test) {
		var data = {a: {aa: "aaval", ab: "abval", c: {inner: "accval"}}, b: {bb: "bbval", bc: "bcval", c: {inner: "bccval"}}}
		var db = Spah.SpahQL.db(data);
		var res = db.select("//c");

		test.equal(res.length, 2);
		test.deepEqual(res.paths(), ["/a/c", "/b/c"]);

		test.ok(res.assert("/inner"));
		test.done();
	},

	"assert() fails if one result fails to meet the assertion": function(test) {
		var data = {a: {aa: "aaval", ab: "abval", c: {inner: "accval"}}, b: {bb: "bbval", bc: "bcval", c: {not_inner: "bccval"}}}
		var db = Spah.SpahQL.db(data);
		var res = db.select("//c");

		test.equal(res.length, 2);
		test.deepEqual(res.paths(), ["/a/c", "/b/c"]);

		test.ok(!res.assert("/inner"));
		test.done();
	},

	"parentPath() returns the parent path for the first item in the set": function(test) {
		var d1 = {path: "/foo/bar/1", value: "bar1"},
				d2 = {path: "/1/2", value: "bar2"},
				d3 = {path: "/1/3", value: "bar3"};
		var s = new Spah.SpahQL(d1, d2, d3);

		test.equal(s.parentPath(), "/foo/bar");
		test.done();
	},

	"parentPath() returns null for the root object": function(test) {
		var s = new Spah.SpahQL({path: "/", value: "foo"});

		test.equal(s.parentPath(), null);
		test.done();
	},

	"parentPaths() returns all parent paths for the set as an array": function(test) {
		var d1 = {path: "/foo/bar/1", value: "bar1"},
				d2 = {path: "/a/2", value: "bar2"},
				d3 = {path: "/b/3", value: "bar3"};
		var s = new Spah.SpahQL(d1, d2, d3);

		test.deepEqual(s.parentPaths(), ["/foo/bar", "/a", "/b"]);
		test.done();
	},

	"parent() returns a SpahQL instance containing the parent of the first item in the set": function(test) {
		var data = {a: {aa: "aaval", ab: "abval", c: {inner: "accval"}}, b: {bb: "bbval", bc: "bcval", c: {not_inner: "bccval"}}}
		var db = Spah.SpahQL.db(data);
		var res = db.select("//c");

		test.equal(res.length, 2);
		test.deepEqual(res.paths(), ["/a/c", "/b/c"]);

		var p = res.parent();
		test.equal(p.length, 1);
		test.deepEqual(p.paths(), ["/a"]);
		test.done();
	},

	"parents() returns a SpahQL instance containing the parents of all items in the set, excluding items with no parent": function(test) {
		var data = {c: "root", a: {aa: "aaval", ab: "abval", c: {inner: "accval"}}, b: {bb: "bbval", bc: "bcval", c: {not_inner: "bccval"}}}
		var db = Spah.SpahQL.db(data);
		var res = db.select("{/,//c}");

		test.equal(res.length, 4);
		test.deepEqual(res.paths(), ["/","/c", "/a/c", "/b/c"]);

		var parents = res.parents();
		test.equal(3, parents.length);
		test.deepEqual(parents.paths(), ["/", "/a", "/b"]);
		test.done();
	},

	"keyName() returns the right name for the first item in a set": function(test) {
		var data = {c: "root", a: {aa: "aaval", ab: "abval", c: {inner: "accval"}}, b: {bb: "bbval", bc: "bcval", c: {not_inner: "bccval"}}}
		var db = Spah.SpahQL.db(data);
		var res = db.select("/a/aa");

		test.equal(res.length, 1);
		test.equal(res.path(), "/a/aa");
		test.equal(res.keyName(), "aa");
		test.done();
	},

	"keyName() returns null for results not from a path query": function(test) {
		var data = {c: "root", a: {aa: "aaval", ab: "abval", c: {inner: "accval"}}, b: {bb: "bbval", bc: "bcval", c: {not_inner: "bccval"}}}
		var db = Spah.SpahQL.db(data);
		var res = db.select("{'a'}");

		test.equal(res.length, 1);
		test.equal(res.path(), null);
		test.equal(res.value(), "a");
		test.equal(res.keyName(), null);
		test.done();
	},

	"keyNames() maps the key names for all items in the set": function(test) {
		var data = {c: "root", a: {aa: "aaval", ab: "abval", c: {inner: "accval"}}, b: {bb: "bbval", bc: "bcval", c: {not_inner: "bccval"}}}
		var db = Spah.SpahQL.db(data);
		var res = db.select("{/,//c}");

		test.equal(res.length, 4);
		test.deepEqual(res.paths(), ["/","/c", "/a/c", "/b/c"]);
		test.deepEqual(res.keyNames(), [null, "c", "c", "c"]);
		test.done();
	},

	"keyNames() returns an empty array for an empty set": function(test) {
		var db = new Spah.SpahQL();
		var res = db.select("/foo");

		test.deepEqual(res.keyNames(), []);
		test.done();
	},

	"type() returns the string object type for any given result": function(test) {
		var data = {bool: true, arr: [], obj: {}, str: "foo", num: 10};
		var db = Spah.SpahQL.db(data);

		test.equal(db.select("/bool").type(), "boolean");
		test.equal(db.select("/arr").type(), "array");
		test.equal(db.select("/obj").type(), "object");
		test.equal(db.select("/str").type(), "string");
		test.equal(db.select("/num").type(), "number");
		test.done();
	}


}