exports["Spah.State.Strategies"] = {

	".keeper applies correctly with an array of simple paths": function(test) {
    var data = {a: {aa: "a.aa.val", bb: "a.bb.val"}, b: {aa: "b.aa.val", bb: "b.bb.val"}};
    var state = new Spah.State(data);
    var strategiser = new Spah.SpahQL.Strategiser();
    test.expect(1);
    strategiser.addStrategy({"paths": ["/a", "/b"]}, Spah.State.Strategies.keeper("/aa"));
    strategiser.run(state, null, null, function(reduced) {

    	test.deepEqual(reduced.value, {a: {aa: "a.aa.val"}, b: {aa: "b.aa.val"}});
	    test.done();

    });

  },

  ".keeper applies correctly with an array of recursive paths": function(test) {
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
    var state = new Spah.State(data);
    var strategiser = new Spah.SpahQL.Strategiser();
    test.expect(1);
    strategiser.addStrategy({"path": "/"}, Spah.State.Strategies.keeper("//b", "//c"));
    strategiser.run(state, null, null, function(reduced) {

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
	    test.done();

    });
  },

  ".remover applies correctly with an array of simple paths": function(test) {
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
    var state = new Spah.State(data);
    var strategiser = new Spah.SpahQL.Strategiser();
    test.expect(1);
    strategiser.addStrategy({"paths": ["/a", "/b"]}, Spah.State.Strategies.remover("/a"));
    strategiser.run(state, null, null, function(reduced) {

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
	    test.done();

    });
  },

  ".remover applies correctly with an array of recursive paths": function(test) {
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

    var state = new Spah.State(data);
    var strategiser = new Spah.SpahQL.Strategiser();
    test.expect(1);
    strategiser.addStrategy({"paths": ["/a", "/b"]}, Spah.State.Strategies.remover("/*//a"));
    strategiser.run(state, null, null, function(reduced) {

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
	    test.done();

    });
  }

}