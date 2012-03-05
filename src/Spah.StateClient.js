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

			// Create the navigator, document manager and get the starting state
	}

});