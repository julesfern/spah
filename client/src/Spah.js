/**
 * class Spah
 * 
 * For cleanliness, the Spah client is wrapped entirely in the <code>window.Spah</code> object.
 * 
 * Initialising Spah in your page is easy:
 *
 *      $(document).ready(function() {
 *        Spah.init();
 *      })
 *
 * See [Default client behaviour](../../index.html#default_client_behaviour) to learn what actions Spah performs on initialisation.
 * For more information on Spah, see the main [Readme](../index.html) ([also available on Github](https://github.com/danski/spah#readme))
 **/
Spah = function() {};
window["Spah"] = Spah;

jQuery.extend(Spah, {
  
  /**
   * Spah.logMessages -> Array
   * A stored array of all messages generated by Spah's logging system.
   **/
  "logMessages": [],
  /**
   * Spah.verbose -> Boolean
   * Set to <true>true</true> if you wish Spah to produce debug output in the browser's console.
   **/
  "verbose": false,
  
  /**
   * Spah.init(options) -> Null
   * 
   * Initialises the Spah client. See [Default client behaviour](../../index.html#default_client_behaviour) to learn what actions
   * Spah performs on initialisation.
   **/
  "init": function(options) {
    // Instantiate state object
  },
  
  /**
   * Spah.log(message, objects) -> String message
   * Logs debug output to Spah's internal logger. If Spah.verbose is set to true, the message will appear in the browser's console.
   **/
  "log": function(message) {
    this.logMessages.push(message);
    if(this.verbose && window.console) {
      console.log.apply(window.console, arguments);
    }
    return message;
  }
});

