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

  "Throws an exception when a supplied reducer strategy is ambiguous": function(test) {
    var errorCalled = false;
    var data = {"foo": "bar"};
    var state = new Spah.State(data);

    try {
      state.addReducer({"path": "/", "keep": "/foo", "remove": "/bar"});
    }
    catch(e) {
      errorCalled = true;
    }

    test.ok(errorCalled);
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

    state.addReducer({"paths": ["/a", "/b"], "keep": ["/a"]});
    var reduced = state.reduce();

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

    state.addReducer({"path": "/", "keep": ["//b", "//c"]});
    var reduced = state.reduce();

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

    state.addReducer({"paths": ["/a", "/b"], "remove": ["/a"]});
    var reduced = state.reduce();

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

    state.addReducer({"paths": ["/a", "/b"], "remove": ["/*//a"]});
    var reduced = state.reduce();

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
  }
  
};