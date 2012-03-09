/**
 * class Spah.StateServer
 *
 * 
 **/
Spah.classCreate("Spah.StateServer", {
	
}, {

	"init": function(options) {
		// Handle options

		// Handle starting values
      this.strategiser = new Spah.SpahQL.Strategiser();
	},

	"identifyStateFromRequest": function(callback) {

	},

	"identifyWarmRequest": function(callback) {

	},

   /**
    * Spah.StateServer#addExpander(strategy, action)
    * - strategy (Object): A SpahQL Strategiser object. See Spah.SpahQL.Strategiser for details.
    * - action (Function): The Strategiser action for this reducer.
    *
    * Adds a new SpahQL Strategy to this server to be applied when expanding the state for 
    * the purposes of populating an HTML render.
    **/
   "addExpander": function(strategy, action) {
      this.strategiser.addStrategy(strategy, "expand", action);
   },
	
	
});