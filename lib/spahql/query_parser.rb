require File.join(File.dirname(__FILE__), "token", "comparison_operator")
require File.join(File.dirname(__FILE__), "token", "string")
require File.join(File.dirname(__FILE__), "token", "numeric")
require File.join(File.dirname(__FILE__), "token", "boolean")
require File.join(File.dirname(__FILE__), "token", "set")
require File.join(File.dirname(__FILE__), "token", "selection_query")

module Spah
  module SpahQL
    
    # Responsible for converting string SpahQL queries into runnable Spah::SpahQL::Query instances.
    # Also maintains an in-memory cache of previously-parsed queries for speed.
    class QueryParser

      # In-memory query cache, keyed by string representation (with spaces removed)
      @@query_cache = {}
      
      # Returns a pre-parsed query for the given query string, or nil
      # @param [String] query_str The string representation of the query
      # @return [Spah::SpahQL::Query, nil] The query, if it exists in memory. Otherwise nil will be returned.
      def self.cached_query(query_str); @@query_cache[query_str]; end
      
      # Stashes a query in the in-memory cache
      # @param [Spah::SpahQL::Query] query The parsed query instance
      # @param [String] query_str The string representation to be used as a key for this cached query.
      def self.cache_query(query, query_str); @@query_cache[query_str] = query; end

      # Parses a string query into a runnable parsed query instance, or retrieves a pre-parsed
      # query from memory if the given string has already been parsed.
      #
      # @param [String] str The string representation of the query.
      # @return [Spah::SpahQL::Query] the string parsed into a runnable parsed query instance
      def self.parse_query(str)
        query = str.gsub(" ", "") # Strip spaces from the query string

        # Pull it from the cache and return if it exists
        cached_query = cached_query(query)
        return cached_query if cached_query

        # Nothing in the cache, prep a new instance
        parsed_query = Spah::SpahQL::Query.new(query)
        
        i=0; read_result = nil;
        while(read_result = read_ahead_token(i, query)) do
          # Handle read result
          i = read_result[0]
          token = read_result[1]
          
          if(token.is_a?(Spah::SpahQL::Token::ComparisonOperator))
            # comparison operator, error if != one token stashed
            if(parsed_query.primary_token && parsed_query.secondary_token.nil?)
              parsed_query.comparison_operator = token
              parsed_query.assertion = true
            else
              raise Spah::SpahQL::Errors::CompilerError.new(
                    i, query, 
                    "Found unexpected TOKEN_COMPARISON_OPERATOR, expected EOL"
                    )
            end#if: valid comparison operator
          else
            # Stash simple types - strings, numerics, booleans - into a set
            if(token.is_a?(Spah::SpahQL::Token::Simple))
              # Convert to set literal
              token = token.to_set
            end
            
            # Now set query tokens appropriately
            if(parsed_query.primary_token)
              if(parsed_query.comparison_operator)
                parsed_query.secondary_token = token
              else
                # invalid: two tokens and no comparison?
                raise Spah::SpahQL::Errors::CompilerError.new(
                      i, query, 
                      "Found unexpected #{token.class}, expected EOL or TOKEN_COMPARISON_OPERATOR"
                      )
              end
            else
              parsed_query.primary_token = token
            end#if: decide storage attribute
          end#if: token types
        end#while
        
        return cache_query(parsed_query, query)
      end
      
      # Detects a token of any type and returns the resume index and the found token, along with the type of token encountered.
      # @param [Numeric] i The index at which to detect the token
      # @param [String] query The string query
      # @return [Hash, nil] A hash with keys :resume_at, :token, :token_type, or nil.
      def self.read_ahead_token(i, query)
        r = nil
        [ 
          Spah::SpahQL::Token::ComparisonOperator,
          Spah::SpahQL::Token::String,
          Spah::SpahQL::Token::Numeric,
          Spah::SpahQL::Token::Boolean,
          Spah::SpahQL::Token::Set,
          Spah::SpahQL::Token::SelectionQuery
        ].each do |klass|
          res = klass.parse_at(i, query)
          return res unless res.nil?
        end
        return nil
      end
      
    end
  end
end