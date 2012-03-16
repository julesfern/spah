/**
 * class Spah.StateServer
 *
 * 
 **/
Spah.classCreate("Spah.StateServer", {
	
}, {

	"init": function(options) {
		// Handle options

		/**
       * Spah.StateServer#strategiser -> Spah.SpahQL.Strategiser
       *
       * The strategiser instance used by the Spah Server for managing expander strategies. See #addExpander.
       **/
      this.strategiser = new Spah.SpahQL.Strategiser();
      
      /**
       * Spah.StateServer#identifyStateFromRequest(delegateOrObject) -> String, Object
       * - delegateOrObject (Function<String, Object>, Object): Either a function to use as a delegate, or the object being checked using the delegate.
       *
       * Tells Spah how to retrieve the State from an inbound client request, or identifies the State from an inbound
       * client request. Retrieving a String or Object from the request is fine - if the delegate function returns
       * a String it will be interpreted as JSON automatically.
       *
       * When called with a function as the argument, sets the delegate function used by Spah to make this determination. 
       * When called with an object argument, passes the argument to the delegate function and returns the result.
       **/
      this.createDelegatedMethod("identifyStateFromRequest", "Couldn't identify state from incoming request");

      /**
       * Spah.StateServer#identifyWarmRequest(delegateOrObject) -> String, Object
       * - delegateOrObject (Function<Boolean>, Object): Either a function to use as a delegate, or the object being checked using the delegate.
       *
       * Tells Spah how to determine the warmth of a request, or determines the warmth of a given request. Warm requests are
       * those made via AJAX or other asynchronous means. The given delegate function should return <code>true</code> if the
       * given request is warm and <code>false</code> if the request is cold.
       *
       * When called with a function as the argument, sets the delegate function used by Spah to make this determination. 
       * When called with an object argument, passes the argument to the delegate function and returns the result.
       **/
      this.createDelegatedMethod("identifyWarmRequest", "Couldn't determine warmth of incoming request");
	},

   "respond": function(req, res, state, blueprint) {

   },

   "createDelegatedMethod": function(name, errMsg) {
      var privateName = "_"+name;
      this[name] = function(callbackOrRequest) {
         if(typeof(callbackOrRequest)=="function") {
            this[privateName] = callbackOrRequest;
            return this;
         }
         else {
            if(!this[privateName]) throw new Error(errMsg+" (please give Spah a delegate function by calling "+name+"(delegateFunction)");
            return this[privateName](callbackOrRequest);
         }
      }
   },

   /**
    * Spah.StateServer#addExpander(strategy, action) -> Object
    * - strategy (Object): A SpahQL Strategiser object. See Spah.SpahQL.Strategiser for details.
    * - action (Function): The Strategiser action for this reducer.
    *
    * Adds a new SpahQL Strategy to this server to be applied when expanding the state for 
    * the purposes of populating an HTML render.
    **/
   "addExpander": function(strategy, action) {
      return this.strategiser.addStrategy(strategy, "expand", action);
   },
	
	
});