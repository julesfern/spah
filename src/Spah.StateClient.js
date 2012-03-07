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
			this.reducers = [];
			this.stateHistory = [];
			this.currentState = {};

			// Create the navigator, document manager and get the starting state
	},

	/**
   * Spah.StateClient#addReducer(reducer) -> Spah.StateClient
   * reducer (Object): A hash containing the reducer properties. Should contain keys ("path" or "paths") and ("keep" or "remove").
   *
   * Adds a new reducer strategy to the state client. Reducer strategies are used to shrink the state so that
   * only the necessary data is sent up the wire to the Spah Server.
   *
   * Whenever the Spah Client makes a request to the Spah Server, a reduced version of the state is sent
   * along with the request, allowing the server to make decisions based on the current UI state. You should
   * specify how the state is reduced by using this method to add reducer strategies.
   *
   * A reducer is a hash made up of one or more paths that you want to reduce, and a set of keys
   * that you either want removed from those paths or a set of keys that should be kept while all
   * other keys are removed. All the queries involved are selection queries, not assertions. 
   * 
   * Here's some examples:
   *
   *    // Remove /tweets from the root
   *    {"path": "/", "remove": "/tweets"}
   *
   *    // Remove anything that contains a key "type" with value "tweet"
   *    {"path": "/", "remove": "//*[/type=='tweet']"} 
   *
   *    // Find everything with type=tweet and reduce it to only the "id" and "type" keys
   *    {"path": "//*[/type=='tweet']", "keep": ["/id", "/type"]} 
   *
   *    // Keep only the first item in the arrays at /mentions and /direct_messages
   *    {"paths": ["/mentions", "/direct_messages"], "keep": "/0"}
   *
   *    // Keep only entries that are tweets any entry containing a tweet at any level
   *    {"paths": "//*", "keep": "/*[/type=='tweet']"}
   *
   * The mechanism uses the basic SpahQL helpers - a set of results to reduce is selected based on the
   * "path" or "paths" key, and then if the reducer specifies a "keep" key, all entries *except* those matching
   * one or more of the "keep" queries are destroyed. If the reducer specifies a "remove" key, all entries matching
   * one or more of the "remove" queries are destroyed.
   *
   * Call state.reduce() to run your reducers. Reducers are run in the order in which you added them.
   * 
   * The "keep" and "remove" keys are mutually exclusive, and using both in the same reducer
   * will throw an error. If for some reason you specify both "path" and "paths", "paths" will
   * take priority and "path" will be ignored.
   *
   * This method returns this StateClient instance so that you may chain addReducer calls.
   **/
   "addReducer": function(reducer) {
      var commonisedReducer = (reducer._commonised)? reducer : Spah.State.commoniseReducer(reducer);
      Spah.log("Attaching reducer to Spah.StateClient instance:", this, commonisedReducer);
      this.reducers.push(commonisedReducer);
      return this;
  }

});