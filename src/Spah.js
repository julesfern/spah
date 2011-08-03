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

/**
 * Spah.logMessages -> Array
 * A stored array of all messages generated by Spah's logging system.
 **/
Spah["logMessages"] = [];

/**
 * Spah.verbose -> Boolean
 * Set to <true>true</true> if you wish Spah to produce debug output in the browser's console.
 **/
Spah["verbose"] = false;

/**
 * Spah.init(options) -> Null
 * 
 * Initialises the Spah client. See [Default client behaviour](../../index.html#default_client_behaviour) to learn what actions
 * Spah performs on initialisation.
 **/
Spah["init"] = function(options) {
  // Instantiate state object
};

/**
 * Spah.log(message, objects) -> String message
 * Logs debug output to Spah's internal logger. If Spah.verbose is set to true, the message will appear in the browser's console.
 **/
Spah["log"] = function(message) {
  this.logMessages.push(message);
  if(this.verbose && window && window.console) {
    console.log.apply(window.console, arguments);
  }
  return message;
};

/**
 * Spah.inBrowser() -> Boolean
 *
 * Returns true if the runtime environment is identified as being in-browser.
 **/
Spah["inBrowser"] = function() {
  return (typeof(window) != "undefined" && typeof(window.location) == "object");
}

/**
 * Spah.isHeadless() -> Boolean
 *
 * Returns true if the runtime environment is identified as being headless e.g. a Node.js runtime.
 **/
Spah["isHeadless"] = function() {
  return !this.inBrowser();
}

Spah["inCommonJS"] = function() {
  return (typeof(exports) == "object");
}

/**
 * Spah.classCreate(name[, klassProps][, instanceProps]) -> Function
 * - name (String): The name for the new Spah class without the "Spah" namespace. E.g. to create Spah.Foo.Bar, use classCreate("Foo.Bar")
 * - klassProps (Object): A hash of class-level properties and functions
 * - instanceProps (Object): A hash of instance-level properties and functions to be applied to the class' prototype.
 *
 * Creates a class internal to the Spah library and namespace.
 **/
Spah["classCreate"] = function(name, klassProps, instanceProps) {
  // Make the class constructor
  var klass = function() { this.init.apply(this, arguments); };
  klassProps = klassProps || {};
  instanceProps = instanceProps || {};
  // Make the singletons
  for(var k in klassProps) {
    klass[k] = klassProps[k];
  }
  // Make the instance methods
  klass.prototype = instanceProps;
  // Default constructor
  klass.prototype.init = klass.prototype.init || function() {};
  
  // Register on the Spah constant
  var nameNS = name.split(".");
  var targetBrowser = this;
  var targetCommonJS = this;
  for(var n=1; n<nameNS.length; n++) {
    var browserName = nameNS[n];
    var commonJSName = browserName.toLowerCase();
    if(n < nameNS.length-1) {
      // intermediary key
      targetBrowser[browserName] = targetBrowser[browserName] || {};
      targetBrowser = targetBrowser[browserName];
      targetCommonJS[commonJSName] = targetCommonJS[commonJSName] || {};
      targetCommonJS = targetCommonJS[commonJSName]
    }
    else {
      // final key
      targetBrowser[browserName] = klass;
      targetCommonJS[commonJSName] = klass;
    }
  }
  // Return class
  return klass;
};

/**
 * Spah.classExtend(name, superKlass[, klassProps][, instanceProps]) -> Function
 * - name (String): The name for the new Spah class without the "Spah" namespace. E.g. to create Spah.Foo.Bar, use classCreate("Foo.Bar")
 * - superKlass (Function): The class to be extended non-destructively.
 * - klassProps (Object): A hash of class-level properties and functions
 * - instanceProps (Object): A hash of instance-level properties and functions to be applied to the class' prototype.
 *
 * Creates a new class that extends another class. Follows the same rules as Spah.classCreate. The superclass does not 
 * need to be a part of the Spah package.
 **/
Spah["classExtend"] = function(name, superKlass, klassProps, instanceProps) {
  var targetKlassProps = {};
  var targetInstanceProps = {};
  klassProps = klassProps || {};
  instanceProps = instanceProps || {};
  // Clone the klass and instance properties from the superclass
  for(var s in superKlass) {
    targetKlassProps[s] = superKlass[s];
  }
  for(var p in superKlass.prototype) {
    targetInstanceProps[p] = superKlass.prototype[p];
  }
  // Inject the subclass
  for(var k in klassProps) {
    targetKlassProps[k] = klassProps[k];
  }
  for(var i in instanceProps) {
    targetInstanceProps[i] = instanceProps[i];
  }
  
  return this.classCreate(name, targetKlassProps, targetInstanceProps);
}

if(Spah.inBrowser()) {
  // Export master class if running in the client environment
  window["Spah"] = Spah;
}
else {
  // Do CommonJS module export otherwise
  exports = Spah;
}
