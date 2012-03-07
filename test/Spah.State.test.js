exports["Spah.State"] = {
  
  "Initialises as a root-level query result": function(test) {
  	var data = {"foo": "bar"};
  	var state = new Spah.State(data);

  	test.equals(state.path, "/");
  	test.ok(Spah.SpahQL.DataHelper.eq(state.value, data));
  	test.done();
  },

  "Commises reducers": function(test) {
    var data = {"foo": "bar"};
    var state = new Spah.State(data);

    var commonisedReducer = state.commoniseReducer({"path": "/", "keep": "/*"});
    test.deepEqual(
      commonisedReducer, 
      {"paths": ["/"], "matchers": ["/*"], "isKeeper": true, "_commonised": true}
    );

    commonisedReducer = state.commoniseReducer({"paths": ["/foo"], "path": "/", "keep": ["/a", "/b"]});
    test.deepEqual(
      commonisedReducer, 
      {"paths": ["/foo"], "matchers": ["/a", "/b"], "isKeeper": true, "_commonised": true}
    );

    commonisedReducer = state.commoniseReducer({"paths": ["/foo1", "/foo2"], "path": "/", "remove": ["/a", "/b"]});
    test.deepEqual(
      commonisedReducer, 
      {"paths": ["/foo1", "/foo2"], "matchers": ["/a", "/b"], "isKeeper": false, "_commonised": true}
    );

    test.done();
  },

  "Reduces on multiple paths with KEEP and a simple path": function(test) {
    var data = {
      "a": {
        "a": {
          "a": "a"
        },
        "b":{
          "b": "b"
        }
      },
      "b": {
        "b": "b"
      }
    };
    var dataClone = Spah.SpahQL.DataHelper.deepClone(data);
    var state = new Spah.State(data);

    var reduced = state.reduce([{"paths": ["/a", "/b"], "keep": ["/a"]}]);

    test.deepEqual(reduced.value, {
      "a": {
        "a": {}
      },
      "b": {}
    });
    test.deepEqual(dataClone, data);

    test.done();
  },

  "Reduces on multiple paths with KEEP and a complex recursive path": function(test) {
    var data = {
      "a": {
        "a": {
          "a": "a",
          "b": "b"
        },
        "b":{
          "b": "b"
        }
      },
      "b": {
        "b": "b",
        "c": {
          "c": "c",
          "d": "d"
        }
      }
    };
    var dataClone = Spah.SpahQL.DataHelper.deepClone(data);
    var state = new Spah.State(data);

    var reduced = state.reduce([{"path": "/", "keep": ["//b", "//c"]}]);

    test.deepEqual(reduced.value, {
      "a": {
        "a": {
          "b": "b"
        },
        "b":{
          "b": "b"
        }
      },
      "b": {
        "b": "b",
        "c": {
          "c": "c"
        }
      }
    });
    test.deepEqual(dataClone, data);

    test.done();
  },

  "Reduces on multiple paths with REMOVE and a simple path": function(test) {
    var data = {
      "a": {
        "a": {
          "a": "a"
        },
        "b":{
          "b": "b"
        }
      },
      "b": {
        "b": "b"
      }
    };
    var dataClone = Spah.SpahQL.DataHelper.deepClone(data);
    var state = new Spah.State(data);

    var reduced = state.reduce([{"paths": ["/a", "/b"], "remove": ["/a"]}]);

    test.deepEqual(reduced.value, {
      "a": {
        "b": {
          "b": "b"
        }
      },
      "b": {
        "b": "b"
      }
    });
    test.deepEqual(dataClone, data);

    test.done();
  },

  "Reduces on multiple paths with REMOVE and a complex recursive path": function(test) {
    var data = {
      "a": {
        "a": {
          "a": "a"
        },
        "b":{
          "b": "b"
        }
      },
      "b": {
        "b": "b"
      }
    };
    var dataClone = Spah.SpahQL.DataHelper.deepClone(data);
    var state = new Spah.State(data);
    var reduced = state.reduce([{"paths": ["/a", "/b"], "remove": ["/*//a"]}]);

    test.deepEqual(reduced.value, {
      "a": {
        "a": {},
        "b": {
          "b": "b"
        }
      },
      "b": {
        "b": "b"
      }
    });
    test.deepEqual(dataClone, data);

    test.done();
  },

  "Commonises expanders": function(test) {
      var cb = function(a) {};
      test.deepEqual(
          Spah.State.commoniseExpander({"path": ["/*", "//*"], "if": "/"}, cb),
          {"_commonised": true, "paths": ["/*", "//*"], "condition": "/", "expectation": true, "action": cb}
      );

      test.deepEqual(
          Spah.State.commoniseExpander({"paths": "/*", "unless": "/"}, cb),
          {"_commonised": true, "paths": ["/*"], "condition": "/", "expectation": false, "action": cb}
      );

      test.done();
  },

  "Expands on a path with an IF condition with a true result": function(test) {
      var data = {"a": {"aa": "aaval"}, "b": {"bb": "bbval"}};
      var state = new Spah.State(data);

      function expanderDone(clone) {
        test.equal(clone.select("/a").first().value, "c");
        test.equal(clone.select("/b").first().value, "c");
        test.equal(clone.select("/*").length(), 2);

        test.equal(state.select("/a/aa").first().value, "aaval");
        test.equal(state.select("/b/bb").first().value, "bbval");
        test.equal(state.select("/*").length(), 2);

        test.done();
      }

      state.expand(expanderDone, {}, [{"path": "/*", "if": "/a", "action": function(results, root, attachments, strategy) {
        process.nextTick(function() {
            results.replaceAll("c");
            strategy.done();
        });
      }}]);
  },

  "Skips the expander for a path with an IF condition with a false result": function(test) {
      var data = {"a": {"aa": "aaval"}, "b": {"bb": "bbval"}};
      var state = new Spah.State(data);
      var ran = false;

      function expanderDone(clone) {
        test.ok(!ran);
        test.done();
      }

      state.expand(expanderDone, {}, [{"path": "/*", "if": "/c", "action": function(results, root, attachments, strategy) {
        process.nextTick(function() {
            ran = true;
            strategy.done();
        });
      }}]);
  },

  "Expands on a path with an UNLESS condition": function(test) {
      var data = {"a": {"aa": "aaval"}, "b": {"bb": "bbval"}};
      var state = new Spah.State(data);

      function expanderDone(clone) {
        test.equal(clone.select("/a").first().value, "c");
        test.equal(clone.select("/b").first().value, "c");
        test.equal(clone.select("/*").length(), 2);

        test.equal(state.select("/a/aa").first().value, "aaval");
        test.equal(state.select("/b/bb").first().value, "bbval");
        test.equal(state.select("/*").length(), 2);

        test.done();
      }

      state.expand(expanderDone, {}, [{"path": "/*", "unless": "/c", "action": function(results, root, attachments, strategy) {
        process.nextTick(function() {
            results.replaceAll("c");
            strategy.done();
        });
      }}]);
  },

  "Skips the expander for a path with an UNLESS condition with a true result": function(test) {
      var data = {"a": {"aa": "aaval"}, "b": {"bb": "bbval"}};
      var state = new Spah.State(data);
      var ran = false;

      function expanderDone(clone) {
        test.ok(!ran);
        test.done();
      }

      state.expand(expanderDone, {}, [{"path": "/*", "unless": "/a", "action": function(results, root, attachments, strategy) {
        process.nextTick(function() {
            ran = true;
            strategy.done();
        });
      }}]);
  },

  "Expands on a path unconditionally": function(test) {
      var data = {"a": {"aa": "aaval"}, "b": {"bb": "bbval"}};
      var state = new Spah.State(data);
      var ran = false;

      function expanderDone(clone) {
        test.ok(ran);
        test.done();
      }

      state.expand(expanderDone, {}, [{"path": "/*", "action": function(results, root, attachments, strategy) {
        process.nextTick(function() {
            ran = true;
            strategy.done();
        });
      }}]);
  },  

  "Expands on multiple paths": function(test) {
      var data = {"a": {"aa": "aaval"}, "b": {"bb": "bbval"}};
      var state = new Spah.State(data);

      function expanderDone(clone) {
        test.equal(clone.select("/a").first().value, "c");
        test.equal(clone.select("/b").first().value, "c");
        test.equal(clone.select("/*").length(), 2);

        test.equal(state.select("/a/aa").first().value, "aaval");
        test.equal(state.select("/b/bb").first().value, "bbval");
        test.equal(state.select("/*").length(), 2);

        test.done();
      }

      state.expand(expanderDone, {}, [{"paths": ["/a", "/b"], "action": function(results, root, attachments, strategy) {
        process.nextTick(function() {
            results.replaceAll("c");
            strategy.done();
        });
      }}]);
  },    

  "Expanding before expansion has completed throws an error": function(test) {
      var data = {"a": {"aa": "aaval"}, "b": {"bb": "bbval"}};
      var state = new Spah.State(data);

      function expanderDone(clone) {
      }

      state.expand(expanderDone, {}, [{"paths": ["/*"], "action": function(results, root, attachments, strategy) {
        process.nextTick(function() {
            strategy.done();
        });
      }}]);

      var thrown = false;
      try {
        state.expand(expanderDone, {}, [{"paths": ["/*"], "action": function(results, root, attachments, strategy) {
          process.nextTick(function() {
              strategy.done();
          });
        }}]);
      }
      catch(e) {
        test.ok(e);
        test.done();
      }
  },

  "Expanding after another expansion has completed throws no error": function(test) {
      var data = {"a": {"aa": "aaval"}, "b": {"bb": "bbval"}};
      var state = new Spah.State(data);

      function expander1Done(clone) {
          clone.expand(expander2Done, {}, [{"paths": ["/*"], "action": function(results, root, attachments, strategy) {
            process.nextTick(function() {
                strategy.done();
            });
          }}]);
      }

      function expander2Done(clone) {
          test.done();
      }

      state.expand(expander1Done, {}, [{"paths": ["/*"], "action": function(results, root, attachments, strategy) {
        process.nextTick(function() {
            strategy.done();
        });
      }}]);
  },
  
};