/**
 * class Spah.StateClient
 *
 * The StateClient is the main piece of running code at the browser end of a Spah application.
 *
 * While the <code>Spah.StateServer</code> is used to vend new State objects as responses to user
 * requests, <code>Spah.StateClient</code> manages the state (actually, a history of states) for 
 * a single user session and is responsible for requesting new states from the Spah Server.
 *
 * The client's responsibilities start when the page is loaded, by configuring the client
 * with the document's starting state.
 *
 * Also during initialisation, the client hooks into the document
 **/
Spah.classCreate("Spah.StateClient", {

	// Singleton methods

}, {

	// Instance methods


	/**
	 * new Spah.StateClient([options])
	 *
	 * 
	 **/
	"init": function(options) {
			// Handle options
			var opts = options || {};

			// Set the default properties
			this.strategiser = new Spah.SpahQL.Strategiser();
			this.stateHistory = [];
			this.currentState = {};

			// Create the navigator, document manager and get the starting state
	},

	/**
	 * Spah.StateClient#addReducer(strategy, action) -> Object
	 * - strategy (Object): A SpahQL Strategiser object. See Spah.SpahQL.Strategiser for details.
	 * - action (Function): The Strategiser action for this reducer.
	 *
	 * Adds a new SpahQL Strategy to this client to be applied when reducing the state for transfer
	 * to the Spah Server. Spah provides a number of convience actions in Spah.State.Strategies:
	 *
	 * 	// Generate a strategy that removes all keys "a" from the root if "/c" exists and is truthy
	 * 	stateClient.addReducer({"path": "/", "if": "/c"}, Spah.State.Strategies.remover("/a"));
	 * 	
	 * 	// Generate a strategy that removes everything but keys "a" (and their parent paths) from the root if "/c" exists and is truthy
	 * 	stateClient.addReducer({"path": "/", "if": "/c"}, Spah.State.Strategies.keeper("/a"));
	 * 	
	 **/
	"addReducer": function(strategy, action) {
      return this.strategiser.addStrategy(strategy, "reduce", action);
   },

   /**
    * Spah.StateClient#reduceState(target, attachments, callback) -> void
    * - target (Spah.State): A Spah.State instance to clone and reduce
    * - attachments (Objects): An attachment object supplied to the reducer strategies
    * - callback (Function): The callback for completion. Receives (target, attachments)
    *
    * Clones any given Spah.State instance and applies all registered "reduce" strategies to it.
    **/
   "reduceState": function(target, attachments, callback) {
   	return this.strategiser.run(target.clone(), "reduce", attachments, callback);
   },

   /**
    * Spah.StateClient#reduceCurrentState(attachments, callback) -> void
    * - attachments (Objects): An attachment object supplied to the reducer strategies
    * - callback (Function): The callback for completion. Receives (target, attachments)
    *
    * Clones the current client state and applies all registered "reduce" strategies to it.
    **/
   "reduceCurrentState": function(attachments, callback) {
   	return this.reduceState(this.currentState, attachments, callback);
   },

});