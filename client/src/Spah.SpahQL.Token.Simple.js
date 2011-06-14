/**
 * class Spah.SpahQL.Token.Simple < Spah.SpahQL.Token.Base
 *
 * A simple superclass for all simple tokens that carry a single value or subtoken.
 **/
 
  // Define and export
  Spah.SpahQL.Token.Simple = function(value) { this.init(value) };
  window["Spah"]["SpahQL"]["Token"]["Simple"] = Spah.SpahQL.Token.Simple;
  
  // Singletons
  jQuery.extend(Spah.SpahQL.Token.Simple, Spah.SpahQL.Token.Base, {
    
  });
  
  // Instance methods
  jQuery.extend(Spah.SpahQL.Token.Simple.prototype, Spah.SpahQL.Token.Base.prototype, {
    
    
    "value": null,
    
    /**
     * new Spah.SpahQL.Token.Simple(value)
     *
     * Instantiate a new simple token with the given primitive value.
     **/
    "init": function(value) {
      this.value = value;
    }
    
  });