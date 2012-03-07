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

 		"commoniseStrategy": function(strategy) {

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