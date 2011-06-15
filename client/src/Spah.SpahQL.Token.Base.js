/**
 * class Spah.SpahQL.Token.Base
 *
 * A simple superclass for all tokens - queries, filters, comparison operators, sets, literals etc.
 * that are encountered during the parsing process
 **/
 
  // Define and export
  Spah.SpahQL.Token.Base = function() { this.init() };
  window["Spah"]["SpahQL"]["Token"]["Base"] = Spah.SpahQL.Token.Base;
  
  // Singletons
  jQuery.extend(Spah.SpahQL.Token.Base, {
    
    /**
     * Spah.SpahQL.Token.Base.parseAt(index, queryString) -> Array\[resumeIndex, foundToken\] or null
     * Should be overridden by the child class.
     **/
    "parseAt": function() {
      throw "I should have been overridden. Something is disastrously wrong.";
    }
    
  });
  
  // Instance methods
  jQuery.extend(Spah.SpahQL.Token.Base.prototype, {
    
    "init": function() {
      
    }
    
  });