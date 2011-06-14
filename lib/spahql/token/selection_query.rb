require File.join(File.dirname(__FILE__), 'base')
require File.join(File.dirname(__FILE__), 'path_component')

module Spah
  module SpahQL
    module Token
      
      # A token representing a standalone selection query.
      class SelectionQuery < Base
        
        # The prefix for any query that is forced to run against the root data scope rather than its local scope.
        ATOM_PATH_ROOT = "$".freeze
        
        # A boolean flag indicating whether or not this query is locked to the root data scope.
        attr_accessor :use_root
        # An array of Spah::SpahQL::Token::PathComponent instances.
        attr_accessor :path_components
        
        # Detects a selection query at the given index in the given string query.
        # A selection query may be composed of an optional root flag followed by one or more
        # path components, read using read_ahead_path_component.
        #
        # @param [Numeric] i The index at which to detect the token
        # @param [String] query The string query
        # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
        def self.parse_at(i, query)
          ch = query[i,1]
          first_component = nil
          # Find first path component using path component parser
          if(ch == ATOM_PATH_ROOT || first_component = Spah::SpahQL::Token::PathComponent.parse_at(i, query))
            query_token = self.new
            j = i

            # Set root flag if found
            if(ch == ATOM_PATH_ROOT)
              first_component = Spah::SpahQL::Token::PathComponent.parse_at(j+1, query)
              if(first_component.nil?)
                raise Spah::SpahQL::Errors::CompilerError.new(
                      j+1, query, 
                      "Found unexpected character '"+query[j+1,1]+"', expected TOKEN_PATH_COMPONENT"
                      )
              end#if: root character not followed by query
              # Exception dealt with, now set root flag and wind ahead
              query_token.use_root = true
              j += 1
            end#if: root query

            # Now read in the path components, start with the first found then go for the additionals
            j = first_component[0]
            query_token.path_components << first_component[1]
            
            path_component = nil
            while(path_component = Spah::SpahQL::Token::PathComponent.parse_at(j, query)) do
              query_token.path_components << path_component[1];
              j = path_component[0];
            end#while
           return [j, query_token];

          end#if: token match
          # No match
          return nil        
        end
        
        # Create a new token with blank-slate defaults
        def initialize
          self.use_root = false
          self.path_components = []
        end
        
        def ==(other_token)
          (other_token.is_a?(self.class)) and other_token.use_root == self.use_root and other_token.path_components == self.path_components
        end
        
      end
      
    end
  end
end