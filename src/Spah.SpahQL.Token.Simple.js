/**
 * class Spah.SpahQL.Token.Simple < Spah.SpahQL.Token.Base
 *
 * A simple superclass for all simple tokens that carry a single value or subtoken.
 **/
 
Spah.classExtend("Spah.SpahQL.Token.Simple", Spah.SpahQL.Token.Base, {

  // Singleton
  // ----------------------
  
}, {
  
  // Instance
  // ----------------------
    
  "value": null,

  /**
   * new Spah.SpahQL.Token.Simple(value)
   *
   * Instantiate a new simple token with the given primitive value.
   **/
  "init": function(value) {
    this.value = value;
  },

  /**
   * Spah.SpahQL.Token#toSet() -> Spah.SpahQL.Token.Set
   * 
   * Wraps this token up in a set, allowing it to be used as a top-level evaluatable token.
   **/
  "toSet": function() {
    return new Spah.SpahQL.Token.Set([this]);
  },

  /**
   * Spah.SpahQL.Token.Simple#evaluate(queryToken, rootData[, scopeData]) -> Array QueryResult
   * - rootData (Object): A root data context for any selection queries that appear in the literal
   * - scopeData (Object): A scoped data context for the scope at which selection queries in the set will be evaluated.
   *
   * Evaluates a set literal, for use when a set is used in a selection query and must be returned as a set of results.
   * If the set is a range, it will be flattened into a set of values.
   **/
  evaluate: function(rootData, scopeData, scopePath) {
    return [Spah.SpahQL.item(null, this.value)];
  }
  
});