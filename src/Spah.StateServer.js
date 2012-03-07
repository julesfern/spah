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
		this.expanders = [];
	},

	"identifyStateFromRequest": function(callback) {

	},

	"identifyWarmRequest": function(callback) {

	},

	/**
   * Spah.StateServer#addExpander(expander) -> Spah.StateServer
   * expander (Object): A hash containing the expander properties. Should contain keys ("path" or "paths") and optionally ("if" or "unless").
   *
   * Adds a new expander strategy to this state server, for application to all states produced by the server. 
	 *
   * Expander strategies are used to flesh out and complete the state
   * in circumstances where the Spah Server is attempting to render HTML for a request given only a partial state
   * with which to do so. See the README for more information on state expanders.
   *
   * An expander is a hash made up of one or more paths that you want to expand, an optional condition required
   * for the expander to run, and a callback function (all expanders are asynchronous, allowing you to fetch data
   * from a database or other remote source).
   *
   * Here's an example expander which, if the user is authenticated, will populate /followers/count with a value.
   *
   *    stateServer.addExpander(
   *      {"path": "/followers/count", "if": "/user_authenticated"},
   *      function(results, state, request, expander) {
   *        twitterUser.fetchFollowerCount(function(count) {
   *          console.log("setting "+queryResult.path+" to "+ count);
   *          results.replace(count);
   *          expander.done();
   *        }
   *      }
   *    );
   *
   * The callback receives _results_, the set of results matching the query /followers/count,
   * _state_, the root-level Spah.State object being expanded, _request_, the HTTP request, and _expander_,
   * an object containing methods you'll use to signal to Spah that this strategy has finished and the next
   * may be started. In the example above, we set the value of /followers/count to some arbitrary value and
   * then call expander.done(), signalling that the expander has completed.
   * 
   * The query or queries specified in _path_ or _paths_ are SpahQL selection queries returning parts of the
   * state for you to modify, while the queries specified in _if_ or _unless_ are SpahQL assertions.
   *
   * 
   * This method returns this StateServer instance so that you may chain addReducer calls.
   **/
  "addExpander": function(expander, callback) {
    var commonisedExpander = (expander._commonised)? expander : Spah.State.commoniseExpander(expander, callback);
    Spah.log("Attaching expander to Spah.StateServer instance: ", this, commonisedExpander);
    this.expanders.push(commonisedExpander);
    return this;
  },
	
});