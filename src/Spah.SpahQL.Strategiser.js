/**
 * class Spah.SpahQL.Strategiser
 *
 * A generic handler class for managing SpahQL Strategies and applying them to SpahQL objects.
 * 
 * The Strategiser allows the creation and registration of SpahQL Strategies, which are macros
 * which may be applied to SpahQL objects such as the Spah State.
 *
 * Strategies are categorised, allowing specific sets of strategies to be executed at any time.
 **/
 Spah.classCreate("Spah.SpahQL.Strategiser", {

 }, {

 		"init": function() {
 			this.strategies = [];
 			this.categories = {};
 		},

 		"addStrategy": function(nameOrCategory, categoryOrStrategy, strategy) {

 		},

 		"removeStrategy": function(name) {

 		},


 		/**
 		 * Spah.SpahQL.Strategiser#commoniseStrategy(strategy) -> Object
 		 * strategy (Object): A strategy object, allowed to use convenience keys such as "if" or "unless"
 		 *
 		 * Accepts a strategy object with convenience keys and converts it to the standardised
 		 * schema expected by strategy objects internally.
 		 **/
 		"commoniseStrategy": function(strategy, callback) {
 			if(strategy._commonised) return strategy;

      var paths = strategy.paths || strategy.path;
      if(typeof(paths) == "string") paths = [paths];

      var expectation = (strategy["if"])? true : false;
      var condition = (expectation ? strategy["if"] : strategy["unless"]) || null;
      var action = strategy.action || callback;

      var commonStrategy = {
        "paths": paths,
        "expectation": expectation,
        "condition": condition,
        "action": action,
        "_commonised": true
      };

      return commonStrategy;
 		},

 		"getStrategies": function(category) {
 			return (category)? this.strategies : this.categories[category];
 		},

 		"run": function(category, target) {
 				var strategies = this.getStrategies(category);
 		},

 		"runStrategyLoop": function() {

 		},

 		"runStrategyQueryLoop": function() {

 		}

 });