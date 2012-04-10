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
	},

	"filter() reduces the set to those for which the scoped assertion is true": function(test) {
		var data = {c: "root", a: {c: {inner: "accval"}}, b: {c: {inner: "bccval"}}}
		var db = Spah.SpahQL.db(data);
		var res = db.select("//c");

		test.equal(res.length, 3);
		var filtered = res.filter("/inner");

		test.equal(filtered.length, 2);
		test.deepEqual(filtered.paths(), ["/a/c", "/b/c"]);
		test.deepEqual(filtered.values(), [{inner: "accval"}, {inner: "bccval"}]);
		test.done();
	},

	"Detaches as a root-level object": function(test) {
		var myDb = Spah.SpahQL.db({foo: {bar: "baz"}});
   	
   	var foo = myDb.select("/foo");   	
   	var fooClone = foo.detach();
   	
   	test.equal(fooClone.length, 1);
   	test.equal(fooClone.path(), "/")
   	test.deepEqual(fooClone.value(), foo.value());
   	test.ok(fooClone.value() != foo.value());

   	test.done();
	},

	"set() Sets a subkey on an array": function(test) {
		var arr = [0,1,2];
		var db = Spah.SpahQL.db({"arr": arr});

		db.select("/arr").set(0, "0-modified");
		test.deepEqual(arr, ["0-modified", 1, 2]);

		db.select("/arr").set("1", "1-modified");
		test.deepEqual(arr, ["0-modified", "1-modified", 2]);

		db.select("/arr").set(3, "3-created");
		test.deepEqual(arr, ["0-modified", "1-modified", 2, "3-created"]);

		test.done();
	},

	"set() Sets a subkey on a hash": function(test) {
		var hsh = {a: "a", b: "b", c: "c"};
		var db = Spah.SpahQL.db({"hsh": hsh});

		db.select("/hsh").set("a", "a-modified");
		test.deepEqual(hsh, {a: "a-modified", b: "b", c: "c"});

		db.select("/hsh").set(1, "1-created");
		test.deepEqual(hsh, {a: "a-modified", b: "b", c: "c", "1": "1-created"});

		test.done();
	},

	"set() is a NOOP on simple types": function(test) {
		var str = "abcd";
		var db = Spah.SpahQL.db({"str": str});

		db.select("/str").set(0, "changed");
		test.deepEqual(db.select("/str").value(), "abcd");
		test.equal(str, "abcd");

		test.done();
	},

	"set() triggers modification callbacks on the affected path": function(test) {
			var hsh1 = {a: "a", b: "b", c: "c"};
			var hsh2 = {a: "aa", b: "bb", c: "cc"};
			var db = Spah.SpahQL.db({"hsh1": hsh1, "hsh2": hsh2});

			var set = db.select("/hsh1");

			set.listen(function(result, path) {
				test.equal(result.length, 1);
				test.equal(result.path(), path);
				test.equal(path, "/hsh1");
				test.equal(result.value(), hsh1);
				test.done();
			});

			set.set("a", "a-modified");
	},

	"setAll() sets on all members in the set": function(test) {
			var hsh1 = {a: "a", b: "b", c: "c"};
			var hsh2 = {a: "aa", b: "bb", c: "cc"};
			var db = Spah.SpahQL.db({"hsh1": hsh1, "hsh2": hsh2});

			db.select("/*").setAll("newkey", "newval");

			test.equal(hsh1.newkey, "newval");
			test.equal(hsh2.newkey, "newval");

			test.done();
	},

	"setAll() ignores non-settable types": function(test) {
		var hsh1 = {a: "a", b: "b", c: "c"};
		var data = {"hsh1": hsh1, "hsh2": "hsh2"};
		var db = Spah.SpahQL.db(data);

		db.select("/*").setAll("newkey", "newval");

		test.equal(hsh1.newkey, "newval");
		test.equal(data.hsh2, "hsh2");

		test.done();
	},	

	"listen() waits for modifications on the entire set": function(test) {
			var hsh = {a: {aa: "aaval"}, b: {aa: "bbval"}};
			var db = Spah.SpahQL.db({"hsh": hsh});

			var set = db.select("/hsh/*");
			test.equal(set.length, 2);

			var listenersTriggered = 0;
			set.listen(function() {
				listenersTriggered++;
				if(listenersTriggered == set.length) test.done();
			});

			set.each(function() {
				this.set("foo", "bar");
			});
	},

	"unlisten() removes a listener": function(test) {
		var hsh = {a: {aa: "aaval"}, b: {aa: "bbval"}};
		var db = Spah.SpahQL.db({"hsh": hsh});

		var observer = function(result, path, subpaths) {
			throw new Error("OH SCIENCE WHY DID I FIRE")
		};

		db.listen("/hsh", observer);
		db.unlisten("/hsh", observer);

		db.select("/hsh/a").set({"bb": "bbval", "cc": "ccval"});
		test.done();
	},

	"replace() on a child key replaces the value in-place and updates the data store": function(test) {
		var hsh = {a: {aa: "aaval"}, b: {aa: "bbval"}};
		var hshReplacement = {x: {xx: "xxval"}};
		var data = {"hsh": hsh};
		var db = Spah.SpahQL.db(data);

		var res = db.select("/hsh");
		res.replace(hshReplacement);

		test.equal(res.value(), hshReplacement);
		test.equal(db.select("/hsh").value(), hshReplacement);
		test.equal(data.hsh, hshReplacement);
		test.done();
	},

	"replace() on the root object is ignored": function(test) {
		var hsh = {a: {aa: "aaval"}, b: {aa: "bbval"}};
		var hshReplacement = {x: {xx: "xxval"}};
		var db = Spah.SpahQL.db(hsh);

		db.replace(hshReplacement);

		test.equal(db.value(), hsh);
		test.equal(db.select("/x").value(), null);
		test.done();
	},

	"replace() triggers listeners": function(test) {
		var hsh = {a: {aa: "aaval"}, b: {aa: "bbval"}};
		var hshReplacement = {x: {xx: "xxval"}};
		var db = Spah.SpahQL.db({"hsh": hsh});

		var res = db.select("/hsh");

		res.listen(function(result, path, subpaths) {
			test.equal(result.value(), hshReplacement);
			test.equal(path, "/hsh");

			test.done();
		})

		res.replace(hshReplacement);
	},

	"replaceAll() works against every item in the set": function(test) {
		var db = Spah.SpahQL.db({arr: ["a",1,2,"3","4"]});

		db.select("//*[/.type=='number']").replaceAll("NO NUMBERS ALLOWED");

		test.deepEqual(
			db.select("/arr").value(),
			["a","NO NUMBERS ALLOWED","NO NUMBERS ALLOWED","3","4"]
		);
		test.done();
	},

	"delete() deletes from the parent": function(test) {
		var inner = {aa: "aa"};
		var outer = {a: inner, b: inner};

		var db = Spah.SpahQL.db(outer);

		db.select("/a").delete();

		test.deepEqual(db.value(), {b: inner});
		test.done();
	},

	"delete() ignored on root object": function(test) {
		var inner = {aa: "aa"};
		var outer = {a: inner, b: inner};

		var db = Spah.SpahQL.db(outer);

		db.delete();

		test.deepEqual(db.value(), {a: inner, b: inner});
		test.done();
	},

	"delete() deletes a key from an array": function(test) {
		var inner = [0,1,2,3,4];
		var outer = {a: inner, b: inner};

		var db = Spah.SpahQL.db(outer);

		db.select("/a").delete(3);

		test.deepEqual(db.value(), {a: inner, b: inner});
		test.deepEqual(inner, [0,1,2,4]);
		test.done();
	},

	"delete() deletes a key from an object": function(test) {
		var inner = {aa: "aa", bb: "bb"};
		var outer = {a: inner, b: inner};

		var db = Spah.SpahQL.db(outer);

		db.select("/a").delete("bb");

		test.deepEqual(db.value(), {a: inner, b: inner});
		test.deepEqual(inner, {aa: "aa"});
		test.done();
	},

	"deleteAll() works against every item in the set": function(test) {
		var inner1 = {aa: "aa", bb: "bb"};
		var inner2 = {aa: "aa", bb: "bb"};
		var outer = {a: inner1, b: inner2};

		var db = Spah.SpahQL.db(outer);

		db.select("/*").deleteAll("bb");

		test.deepEqual(db.value(), {a: inner1, b: inner2});
		test.deepEqual(inner1, {aa: "aa"});
		test.deepEqual(inner2, {aa: "aa"});
		test.done();
	},


}

//var data;
//var dataResult;
//var setup = function() {
//  data = {foo: {foo: "bar"}, booltest: {yes: true, no: false}, arrtest: ["a", "b", "c"], stringtest: "abc"};
//}
//
//exports["Spah.SpahQL.QueryResult"] = {
//  
//  "Retrieves the parent path": function(test) {
//    setup();
//    
//    var res;
//    res = new Spah.SpahQL.QueryResult("/", 0);
//    test.equal(res.parentPath(), null);
//    res = new Spah.SpahQL.QueryResult("/foo/bar/.baz", 0);
//    test.equal(res.parentPath(), "/foo/bar");
//    test.done();
//  },
//  
//  "Retrieves the correct key name": function(test) {
//    setup();
//    
//    var res;
//    res = new Spah.SpahQL.QueryResult(null, 1);
//    test.equal(res.keyName(), null);
//    res = new Spah.SpahQL.QueryResult("/", 1);
//    test.equal(res.keyName(), null);
//    res = new Spah.SpahQL.QueryResult("/foo/bar/baz", 1);
//    test.equal(res.keyName(), "baz");
//    test.done();
//  },
//  
//  "Retrieves the parent": function(test) {
//    setup();
//    
//    var set = Spah.SpahQL.select("/foo/foo", data);
//    test.deepEqual(set.first().parent(), Spah.SpahQL.select("/foo", data).first());
//    test.done();
//  },
//
//  "Determines whether one result contains another": function(test) {
//    setup();
//
//    var foo = Spah.SpahQL.select("/foo", data).first();
//    var foofoo = foo.select("/foo").first();
//    var foofooclone = foo.detach();
//
//    test.ok(foo && foofoo);
//    test.ok(foo.contains(foofoo));
//    test.ok(!foofoo.contains(foo));
//    test.ok(!foo.contains(foofooclone));
//    test.done();
//  },
//  
//  "Allows sub-selections": function(test) {
//    setup();
//    
//    test.deepEqual(Spah.SpahQL.select("/foo", data).first().select("/foo"), Spah.SpahQL.select("/foo/foo", data));
//    test.done();
//  },
//  
//  "Allows sub-assertions": function(test) {
//    setup();
//    
//    test.ok(Spah.SpahQL.assert("/booltest/yes", data));
//    test.ok(!Spah.SpahQL.assert("/booltest/no", data));
//    test.ok(Spah.SpahQL.select("/booltest", data).first().assert("/yes"));
//    test.ok(!Spah.SpahQL.select("/booltest", data).first().assert("/no"));
//    test.done();
//  },
//  
//  "May set a subkey on self and alter the root data construct in the process": function(test) {
//    setup();
//    
//    var res;
//    
//    // Test objects
//    res = Spah.SpahQL.select("/foo", data).first();
//    test.ok(res.set(0, "zero"));
//    test.ok(res.set("baz", "car"));
//    test.ok(!res.set("", "empty"));
//    test.ok(!res.set(" ", "spaces"));
//    test.equal(data["foo"]["0"], "zero");
//    test.equal(data["foo"]["baz"], "car");
//    test.equal(data["foo"][""], null);
//    test.equal(data["foo"][" "], null);
//    
//    // Test arrays
//    res = Spah.SpahQL.select("/arrtest", data).first();
//    test.ok(res.set(0, "replaced-a"));
//    test.ok(res.set("1", "replaced-b"));
//    test.ok(!res.set("stringkey", "stringval"));
//    test.deepEqual(data["arrtest"], ["replaced-a", "replaced-b", "c"]);
//    
//    // Test strings, bools reject the set
//    res = Spah.SpahQL.select("/stringtest", data).first();
//    test.ok(!res.set(0, "_"));
//    test.ok(!res.set("1", "_"));
//    test.equal(data["stringtest"], "abc");
//    test.done();
//  },
//
//  "May set subkey on self using a k/v hash of values to set": function(test) {
//    setup();
//
//    var res = Spah.SpahQL.select("/foo", data).first();
//    test.ok(res.set({"new1": "val1", "new2": "val2"}));
//
//    test.equal(res.select("/new1").first().value, "val1");
//    test.equal(res.select("/new2").first().value, "val2");
//    test.done();
//  },
//  
//  "May replace own value on the parent": function(test) {
//    setup();
//    
//    var res = Spah.SpahQL.select("/foo/foo", data).first();
//    test.equal(res.value, "bar");
//    test.ok(res.replace("bar-replaced"));
//    
//    test.equal(data.foo.foo, "bar-replaced");
//    test.equal(res.value, "bar-replaced");
//    res = Spah.SpahQL.select("/foo/foo", data).first();
//    test.equal(res.value, "bar-replaced");    
//    test.done();
//  },
//  
//  "Registers a callback at a child path": function(test) {
//    setup();
//    
//    var data = {foo: {bar: {baz: "val"}}};
//    var callbackCounts = [0,0,0];
//    var callback0 = function() { callbackCounts[0]++; };
//    var callback1 = function() { callbackCounts[1]++; };
//    var callback2 = function() { callbackCounts[2]++; };
//    
//    var root = Spah.SpahQL.select("/", data).first();
//        root.modified(callback0);
//        root.modified("/newkey", callback1);
//        
//    var foo = root.select("/foo").first();
//        foo.modified("/newkey", callback2);
//    
//    root.set("foo", "bar");
//    test.deepEqual(callbackCounts, [1,0,0]);
//    root.set("newkey", "newval");
//    test.deepEqual(callbackCounts, [2,1,0]);
//    foo.set("arbitrary", "arb");
//    test.deepEqual(callbackCounts, [3,1,0]);
//    foo.set("newkey", "newval");
//    test.deepEqual(callbackCounts, [4,1,1]);
//    test.done();
//  },
//
//  "Does not modify the original data or trigger events on the original data when detached": function(test) {
//    setup();
//
//    var data = {foo: {bar: {baz: "val"}}};
//    var callbackCounts = [0,0];
//    var callback0 = function() { callbackCounts[0]++; };
//    var callback1 = function() { callbackCounts[1]++; };
//
//    var root = Spah.SpahQL.select("/", data).first();
//        root.modified(callback0);
//
//    var detached = root.detach();
//        detached.modified(callback1);
//
//    root.set("foo", "bar");
//    test.deepEqual(callbackCounts, [1,0]);
//
//    detached.set("foo", "bar");
//    test.deepEqual(callbackCounts, [1,1]);
//
//    test.done();
//  },
//  
//  "Deletes a child key in an array value": function(test) {
//    setup();
//    
//    var data = {foo: [0,1,2,3]};
//    var foo = Spah.SpahQL.select("/foo", data).first();
//    var callbackCounts = [0,0];
//    foo.modified("/1", function() { callbackCounts[0]++; });
//    foo.modified("/2", function() { callbackCounts[1]++; });
//    
//    test.deepEqual(foo.value, [0,1,2,3]);
//    foo.delete(1, "2");
//    test.deepEqual(foo.value, [0,3]);
//    test.deepEqual(callbackCounts, [1,1]);    
//    test.done();
//  },
//  
//  "Deletes a child key in a hash value": function(test) {
//    setup();
//    
//    var data = {foo: {a: 1, b: 2, c:3}};
//    var foo = Spah.SpahQL.select("/foo", data).first();
//    var callbackCounts = [0,0];
//    foo.modified("/a", function() { callbackCounts[0]++; });
//    foo.modified("/b", function() { callbackCounts[1]++; });
//    
//    test.deepEqual(foo.value, {a: 1, b: 2, c:3});
//    foo.delete("a", "b");
//    test.deepEqual(foo.value, {c:3});
//    test.deepEqual(callbackCounts, [1,1]);    
//    test.done();
//  },
//  
//  "Self-deletes from parent value": function(test) {
//    setup();
//    
//    var data = {foo: {a: 1, b: 2, c:3}, bar: {a: 1, b: 2, c:3}};
//    var bar = Spah.SpahQL.select("/bar", data).first();
//    
//    test.deepEqual(bar.value, {a: 1, b: 2, c:3});
//    bar.delete();
//    test.deepEqual(data, {foo: {a: 1, b: 2, c:3}}); // also asserts that data source was modified
//    test.done();
//  },
//
//  "Appends to an array item and raises events": function(test) {
//    setup();
//    var dataResult = new Spah.SpahQL.QueryResult("/", data);
//
//    var arrayModified = 0;
//    var itemModified = 0;
//    var otherModified = 0;
//
//    var res = dataResult.select("/arrtest").first();
//    var valueLength = res.value.length;
//
//    dataResult.modified("/arrtest", function(path, result) {
//        if(path == "/arrtest") arrayModified++;
//        else otherModified++;
//    });
//    dataResult.modified("/arrtest/"+valueLength, function(path, result) {
//        if(path == "/arrtest/"+valueLength) itemModified++;
//        else otherModified++;
//    });
//
//    res.append("d");
//    test.equal(res.value.length, valueLength+1);
//    test.equal(arrayModified, 1);
//    test.equal(itemModified, 1);
//    test.equal(otherModified, 0);
//    test.done();
//  },
//
//  "Appends to a string item and raises events": function(test) {
//    setup();
//    var dataResult = new Spah.SpahQL.QueryResult("/", data);
//
//    var stringModified = 0;
//    var otherModified = 0;
//
//    var res = dataResult.select("/stringtest").first();
//
//    dataResult.modified("/stringtest", function(path, result) {
//        if(path == "/stringtest") stringModified++;
//        else otherModified++;
//    });
//    
//    var prev = res.value;
//    res.append("d");
//    test.equal(res.value, prev+"d");
//    test.equal(stringModified, 1);
//    test.equal(otherModified, 0);
//    test.done();
//  },
//
//  "Prepends to an array item and raises events": function(test) {
//    setup();
//    var dataResult = new Spah.SpahQL.QueryResult("/", data);
//
//    var arrayModified = 0;
//    var itemModified = 0;
//    var otherModified = 0;
//
//    var res = dataResult.select("/arrtest").first();
//    var valueLength = res.value.length;
//
//    dataResult.modified("/arrtest", function(path, result) {
//        if(path == "/arrtest") arrayModified++;
//        else otherModified++;
//    });
//    dataResult.modified("/arrtest/0", function(path, result) {
//        if(path == "/arrtest/0") itemModified++;
//        else otherModified++;
//    });
//
//    res.prepend("d");
//    test.equal(res.value[0], "d");
//    test.equal(res.value.length, valueLength+1);
//    test.equal(arrayModified, 1);
//    test.equal(itemModified, 1);
//    test.equal(otherModified, 0);
//    test.done();
//  },
//
//  "Prepends to a string item and raises events": function(test) {
//    setup();
//    var dataResult = new Spah.SpahQL.QueryResult("/", data);
//
//    var stringModified = 0;
//    var otherModified = 0;
//
//    var res = dataResult.select("/stringtest").first();
//
//    dataResult.modified("/stringtest", function(path, result) {
//        if(path == "/stringtest") stringModified++;
//        else otherModified++;
//    });
//    
//    var prev = res.value;
//    res.prepend("d");
//    test.equal(res.value, "d"+prev);
//    test.equal(stringModified, 1);
//    test.equal(otherModified, 0);
//    test.done();
//  },
//
//  "Concats to an array": function(test) {
//    setup();
//    var dataResult = new Spah.SpahQL.QueryResult("/", data);
//    var res = dataResult.select("/arrtest").first();
//
//    var orig = ["a", "b", "c"];
//
//    res.concat("1", "2");
//    test.deepEqual(res.value, ["a","b","c","1","2"]);
//
//    res.concat(["3", "4"]);
//    test.deepEqual(res.value, ["a","b","c","1","2","3","4"]);    
//
//    test.done();
//  },
//
//  "Unshifts to an array": function(test) {
//    setup();
//    var dataResult = new Spah.SpahQL.QueryResult("/", data);
//    var res = dataResult.select("/arrtest").first();
//
//    var orig = ["a", "b", "c"];
//
//    res.unshift("1", "2");
//    test.deepEqual(res.value, ["1","2","a","b","c"]);
//
//    res.unshift(["3", "4"]);
//    test.deepEqual(res.value, ["3","4","1","2","a","b","c"]);    
//
//    test.done();
//  }
//  
//};

//var data;
//var setup = function() {
//  data = {foo: {foo: "bar"}, str1: "1", str2: "2"};
//}
//
//exports["Spah.SpahQL.QueryResultSet"] = {
// 
//  "set() works on the first result in the set": function(test) {
//    setup();
//  
//    var set = Spah.SpahQL.select("//foo", data);
//    test.ok(set.set("inner", "ok"));
//    test.equal(data["foo"]["inner"], "ok");
//    test.done();
//  },
//  
//  "replace() works on the first result in the set": function(test) {
//    setup();
//  
//    var set = Spah.SpahQL.select("//foo", data);
//    test.ok(set.replace("replaced"));
//    test.equal(data["foo"], "replaced");
//    test.done();
//  },
//  
//  "replaceAll() works on all values": function(test) {
//    setup();
//  
//    var set = Spah.SpahQL.select("/*[/.type == 'string']", data);
//    var prev = data.foo;
//    test.ok(set.replaceAll("replaced"));
//    test.equal(prev, data.foo);
//    test.equal(data.str1, "replaced");
//    test.equal(data.str2, "replaced");
//    test.done();
//  },
//  
//  "replaceEach() replaces only if the test function returns true": function(test) {
//    setup();
//  
//    var set = Spah.SpahQL.select("/*[/.type == 'string']", data);
//    set.replaceEach("replaced", function() {
//      return this.path == "/str1";
//    });
//    test.equal(data.str1, "replaced");
//    test.equal(data.str2, "2");
//    test.done();
//  },
//  
//  "modified(callback) registers callbacks for every result": function(test) {
//    setup();
//  
//    Spah.SpahQL.Callbacks.reset();
//    var set = Spah.SpahQL.select("/*[/.type == 'string']", data);
//    
//    set.modified(function() { return 15; });
//    
//    test.ok(Spah.SpahQL.Callbacks.callbacks["/str1"]);
//    test.ok(Spah.SpahQL.Callbacks.callbacks["/str2"]);
//    test.done();
//  },
//  
//  "delete() acts on the first result": function(test) {
//    setup();
//  
//    var set = Spah.SpahQL.select("/foo/foo", data);
//    set.delete();
//    test.deepEqual(data.foo, {});
//    test.done();
//  },
//  
//  "deleteAll() works on the entire set": function(test) {
//    setup();
//  
//    var set  = Spah.SpahQL.select("/*", data);
//    set.deleteAll();
//    test.deepEqual(data, {});
//    test.done();
//  }
//  
//};