/**
 * class Spah.SpahQL.Errors
 *
 * A containing namespace for all exceptions generated within the SpahQL library.
 **/
Spah.SpahQL.Errors = {};

/**
 * class Spah.SpahQL.Errors.SpahQLError
 *
 * Defines an abstract exception class for all errors generated within the SpahQL library.
 **/
Spah.SpahQL.Errors.SpahQLError = function(message) { this.name = "SpahQLError"; this.message = (message || ""); };
Spah.SpahQL.Errors.SpahQLError.prototype = Error.prototype;

/**
 * class Spah.SpahQL.Errors.SpahQLRunTimeError < Spah.SpahQL.Errors.SpahQLError
 *
 * An error class used for runtime query evaluation errors, usually generated in the QueryRunner class.
 **/
Spah.SpahQL.Errors.SpahQLRunTimeError = function(message) { this.name = "SpahQLRunTimeError"; this.message = (message || ""); };
Spah.SpahQL.Errors.SpahQLRunTimeError.prototype = Spah.SpahQL.Errors.SpahQLError.prototype;