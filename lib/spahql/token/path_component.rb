require File.join(File.dirname(__FILE__), 'base')
require File.join(File.dirname(__FILE__), 'filter_query')
require File.join(File.dirname(__FILE__), 'key_name')
require File.join(File.dirname(__FILE__), '..', 'errors')

module Spah
  module SpahQL
    module Token
      
      # A token representing a path component within a selection query, with 
      # an optional set of filter queries.
      class PathComponent < Base
        
        # The delimiter expected at the beginning of any path segment
        ATOM_PATH_DELIMITER = "/".freeze
        # The prefix for a property or other virtual key when used in a path segment
        ATOM_PROPERTY_IDENTIFIER = ".".freeze
        # The wildcard glyph for use in path components
        ATOM_PATH_WILDCARD = "*".freeze
        
        # The keyname for this path component, if specified
        attr_accessor :key
        # The property name for this path component, if specified
        attr_accessor :property
        # A boolean flag indicating whether or not this path component should be executed recursively
        attr_accessor :recursive
        # An array of Spah::SpahQL::Token::FilterQuery instances.
        attr_accessor :filter_queries
        
        # Detects a path component at the given index in the given string query.
        # A path component is composed of one or more path delimiters follows by a key or property name
        # and an optional set of filter queries, read ahead using read_ahead_filter_query.
        #
        # @param [Numeric] i The index at which to detect the token
        # @param [String] query The string query
        # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
        def self.parse_at(i, query)
          ch = query[i, 1]
          if(ch == ATOM_PATH_DELIMITER)
            j = i+1;
            # Set up the blank path component
            path_component = self.new

            # 1. Handle recursive
            if(query[j,1] == ATOM_PATH_DELIMITER)
              path_component.recursive = true
              j += 1
            end#if: recursive

            # 2. Wildcards
            if(query[j,1] == ATOM_PATH_WILDCARD)
              path_component.key = ATOM_PATH_WILDCARD
              j += 1          
            else
              
              # 3. Identify key type
              if(query[j,1] == ATOM_PROPERTY_IDENTIFIER)
                using_property = true
                j += 1
              elsif(query[j,1] == ATOM_PATH_DELIMITER)
                raise Spah::SpahQL::Errors::CompilerError.new(
                      j+1, query, 
                      "Too many ATOM_PATH_DELIMITER in a row - maximum allowed is two."
                      )
              end#if: property identifier found or too many slashes

              # 4. Read key or property name
              keyname_result = Spah::SpahQL::Token::KeyName.parse_at(j, query)
              if(keyname_result.nil? and using_property)
                raise Spah::SpahQL::Errors::CompilerError.new(
                      j, query, 
                      "Unexpected character #{query[j,1]}, expected TOKEN_PROPERTY"
                      )
              elsif(keyname_result)
                # stash found key
                path_component.send((using_property)? :"property=" : :"key=", keyname_result[1].value) 
                j = keyname_result[0]
              end#if:keyname or propertyname found
            end#if: wildcard/property/key

            # 5. Read filter queries
            filter_query_result = nil
            while(filter_query_result = Spah::SpahQL::Token::FilterQuery.parse_at(j, query)) do
              path_component.filter_queries << filter_query_result[1].value
              j = filter_query_result[0]
            end

            return [j, path_component]
          end#if: token match
          # No match
          return nil
        end#self.parse_at
        
        # Create a new PathComponent token with blank-slate values
        def initialize
          self.key = nil
          self.property = nil
          self.recursive = false
          self.filter_queries = []
        end
        
        # Equality helper for this token type
        def ==(other_token)
          (other_token.is_a?(self.class)) and   other_token.key == self.key and 
                                                other_token.property == self.property and 
                                                other_token.recursive == self.recursive and
                                                other_token.filter_queries == self.filter_queries
        end
        
      end
      
    end
  end
end