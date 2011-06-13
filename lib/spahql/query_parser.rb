module Spah
  module SpahQL
    
    # Responsible for converting string SpahQL queries into runnable Spah::SpahQL::Query instances.
    # Also maintains an in-memory cache of previously-parsed queries for speed.
    class QueryParser

      # The strict equality operator as used in the parser
      COMPARISON_STRICT_EQUALITY = "==".freeze
      # The rough equality operator as used in the parser
      COMPARISON_ROUGH_EQUALITY = "=~".freeze
      # The inequality operator as used in the parser
      COMPARISON_INEQUALITY = "!=".freeze
      # The less than operator as used in the parser
      COMPARISON_LT = "<".freeze
      # The greater than operator as used in the parser
      COMPARISON_GT = ">".freeze
      # The less than (or equal to) operator as used in the parser
      COMPARISON_LTE = "<=".freeze
      # The greater than (or equal to) operator as used in the parser
      COMPARISON_GTE = ">=".freeze
      # The joint set operator as used in the parser
      COMPARISON_JOINT_SET = "}~{".freeze
      # The superset operator as used in the parser
      COMPARISON_SUPERSET = "}>{".freeze
      # The subset operator as used in the parser
      COMPARISON_SUBSET = "}<{".freeze
      # The disjoint set operator as used in the parser
      COMPARISON_DISJOINT_SET = "}!{".freeze 
      # All valid SpahQL operators collected into an array for convenience.
      COMPARISON_OPERATORS = [
        COMPARISON_STRICT_EQUALITY, COMPARISON_ROUGH_EQUALITY, COMPARISON_INEQUALITY,
        COMPARISON_LT, COMPARISON_GT, COMPARISON_LTE, COMPARISON_GTE,
        COMPARISON_JOINT_SET, COMPARISON_SUPERSET, COMPARISON_SUBSET, COMPARISON_DISJOINT_SET
      ].freeze
     
      # A single quote
      ATOM_QUOTE_SINGLE = "'".freeze
      # A double quote
      ATOM_QUOTE_DOUBLE = '"'.freeze
      # A string escape
      ATOM_ESCAPE = '\\'.freeze
      # A decimal point
      ATOM_NUMERIC_POINT = ".".freeze
      # The prefix for negative numbers
      ATOM_NUMERIC_NEGATIVE = "-".freeze
      # A boolean true
      ATOM_BOOLEAN_TRUE = "true".freeze
      # A boolean false
      ATOM_BOOLEAN_FALSE = "false".freeze
      # The opening character for a set literal
      ATOM_SET_START = "{".freeze
      # The terminating character for a set literal
      ATOM_SET_END = "}".freeze
      # The delimiter for multi-value sets
      ATOM_SET_ARRAY_DELIMITER = ",".freeze
      # The delimter for range sets
      ATOM_SET_RANGE_DELIMITER = "..".freeze
      # The delimiter expected at the beginning of any path segment
      ATOM_PATH_DELIMITER = "/".freeze
      # The prefix for any query that is forced to run against the root data scope rather than its local scope.
      ATOM_PATH_ROOT = "$".freeze
      # The opening character for an inline filter query
      ATOM_FILTER_QUERY_START = "[".freeze
      # The terminating character for an inline filter query
      ATOM_FILTER_QUERY_END = "]".freeze
      # The prefix for a property or other virtual key when used in a path segment
      ATOM_PROPERTY_IDENTIFIER = ".".freeze
      # The wildcard glyph for use in path components
      ATOM_PATH_WILDCARD = "*".freeze
      
      # A token representing a string literal in or out of a set
      TOKEN_STRING_LITERAL = "TOKEN_STRING_LITERAL".freeze
      # A token representing an integer or floating-point literal, in or out of a set
      TOKEN_NUMERIC_LITERAL =  "TOKEN_NUMERIC_LITERAL".freeze
      # A token representing a boolean literal i.e. true or false
      TOKEN_BOOLEAN_LITERAL = "TOKEN_BOOLEAN_LITERAL".freeze
      # A token representing a set literal
      TOKEN_SET_LITERAL = "TOKEN_SET_LITERAL".freeze
      # A token representing one or more path components chained into a selection query
      TOKEN_SELECTION_QUERY = "TOKEN_SELECTION_QUERY".freeze
      # A token representing any of the comparison operators specified in COMPARISON_OPERATORS
      TOKEN_COMPARISON_OPERATOR = "TOKEN_COMPARISON_OPERATOR".freeze
      
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
        cached_query = self.cached_query(query)
        return cached_query if cached_query

        # Nothing in the cache, prep a new instance
        parsed_query = Spah::SpahQL::Query.new(query)
        
        i=0; read_result = nil;
        while(read_result = read_ahead_token(i, query)) do
          # Handle read result
          
        end
        
        return parsed_query
      end
      
      # Detects a token of any type and returns the resume index and the found token, along with the type of token encountered.
      # @param [Numeric] i The index at which to detect the token
      # @param [String] query The string query
      # @return [Hash, nil] A hash with keys :resume_at, :token, :token_type, or nil.
      def self.read_ahead_token(i, query)
      end

      # Detects string literals at the given index in the given string query.
      #
      # @param [Numeric] i The index at which to detect the token
      # @param [String] query The string query
      # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
      def self.read_ahead_string_literal(i, query)
        ch = query[i,1]
        if(ch == ATOM_QUOTE_SINGLE or ch == ATOM_QUOTE_DOUBLE)
          quote_type = ch; j = 0; str = "";
          while(true) do
            # Run through until terminator found
            j += 1
            ch = query[i+j,1]
            puts "inspecting #{ch.inspect} at #{i}+#{j}"
            if(query.length < i+j)
              # unexpected EOL
              raise Spah::SpahQL::Errors::CompilerError.new(
                    i+j, query, 
                    "Encountered EOL when expecting #{(quote_type==ATOM_QUOTE_SINGLE)? "ATOM_QUOTE_SINGLE" : "ATOM_QUOTE_DOUBLE"}"
                    )
            elsif(ch == quote_type)
              # string terminated
              j += 1
              break
            elsif(ch == ATOM_ESCAPE)
              # escape, skip ahead
              str << query[i+j+1, 1]
              j += 1;
            else
              # build string
              str << ch
            end #if: character match
          end #while
          return [i+j, str]
        end #if: token match
        # No match
        return nil
      end
      
      # Detects numeric literals at the given index in the given string query.
      #
      # @param [Numeric] i The index at which to detect the token
      # @param [String] query The string query
      # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
      def self.read_ahead_numeric_literal(i, query)
        ch = query[i,1]
        numreg = /\d/
        if(ch.match(numreg) or (ch == ATOM_NUMERIC_NEGATIVE and query[i+1,1].match(numreg)))
          j = 0; num = ch; point_found = false;
          while(true) do
            j += 1; ch = query[i+j, 1];
            if(query.length < i+j)
              # EOL
            elsif(ch == ATOM_NUMERIC_POINT)
              # found point
              if(point_found)
                # Rewind and surrender
                j -= 1
                break
              else
                point_found = true
                num << ch
              end
            elsif(ch.match(numreg))
              # found more numerics, append to token
              num << ch
            else
              # found non-numeric
              break
            end #if: character match
          end#while
          return [i+j, ((point_found)? num.to_f : num.to_i)]
        end #if: token match
        # No match
        return nil
      end
      
      # Detects boolean literals at the given index in the given string query.
      #
      # @param [Numeric] i The index at which to detect the token
      # @param [String] query The string query
      # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
      def self.read_ahead_boolean_literal(i, query)
        return [i+ATOM_BOOLEAN_TRUE.length, true] if(query[i, ATOM_BOOLEAN_TRUE.length] == ATOM_BOOLEAN_TRUE) 
        return [i+ATOM_BOOLEAN_FALSE.length, false] if(query[i, ATOM_BOOLEAN_FALSE.length] == ATOM_BOOLEAN_FALSE)
        return nil
      end
      
      # Detects a selection query at the given index in the given string query.
      # A selection query may be composed of an optional root flag followed by one or more
      # path components, read using read_ahead_path_component.
      #
      # @param [Numeric] i The index at which to detect the token
      # @param [String] query The string query
      # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
      def self.read_ahead_selection_query(i, query)
        ch = query[i,1]
        if(ch == ATOM_PATH_ROOT || ch == ATOM_PATH_DELIMITER)
          query_token = {:use_root => false, :path_components => [], :type => TOKEN_SELECTION_QUERY}
          j = i
          
          # Set root flag if found
          if(ch == ATOM_PATH_ROOT)
            if(query[j+1,1] != ATOM_PATH_DELIMITER)
              raise Spah::SpahQL::Errors::CompilerError.new(
                    j+1, query, 
                    "Found unexpected character '"+query[j+1,1]+"', expected ATOM_PATH_DELIMITER"
                    )
            end#if: root character not followed by query
            # Exception dealt with, now set root flag and wind ahead
            query_token[:use_root] = true
            j += 1
          end#if: root query
          
          # Now read in the path components
          path_component = nil
          while(path_component = read_ahead_path_component(j, query)) do
            pq[:path_components] << pathComponent[1];
            j = pathComponent[0];
          end#while
         return [j, pq];
          
        end#if: token match
        # No match
        return nil        
      end
      
      # Detects a path component at the given index in the given string query.
      # A path component is composed of one or more path delimiters follows by a key or property name
      # and an optional set of filter queries, read ahead using read_ahead_filter_query.
      #
      # @param [Numeric] i The index at which to detect the token
      # @param [String] query The string query
      # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
      def self.read_ahead_path_component(i, query)
        ch = query[i, 1]
        if(ch == ATOM_PATH_DELIMITER)
          j = i+1;
          # Set up the blank path component
          path_component = {:key => nil, :property => nil, :recursive => false, :filter_queries => []}
          using_property = false
          
          # 1. Handle recursive
          if(query[j,1] == ATOM_PATH_DELIMITER)
            path_component[:recursive] = true
            j += 1
          end#if: recursive
          
          # 2. Wildcards
          if(query[j,1] == ATOM_PATH_WILDCARD)
            path_component[:key] = ATOM_PATH_WILDCARD
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
            keyname_result = read_ahead_inline_variable_reference(j, query)
            if(keyname_result.nil? and using_property)
              raise Spah::SpahQL::Errors::CompilerError.new(
                    j, query, 
                    "Unexpected character #{query[j,1]}, expected TOKEN_PROPERTY"
                    )
            elsif(keyname_result)
              # stash found key
              path_component[(using_property)? :property : :key] = keyname_result[1]
              j = keyname_result[0]
            end#if:keyname or propertyname found
          end#if: wildcard/property/key
          
          # 5. Read filter queries
          filter_query_result = nil
          while(filter_query_result = read_ahead_filter_query(j, query)) do
            path_component[:filter_queries] << filter_query_result[1]
            j = filter_query_result[0]
          end
          
          return [j, path_component]
        end#if: token match
        # No match
        return nil
      end
      
      # Detects a filter query at the given index in the given string query.
      # A filter query is a selection or assertion query wrapped in the ATOM_FILTER_QUERY_START and
      # ATOM_FILTER_QUERY_END character atoms and is parsed as an independent using parse_query. 
      # 
      # This has the benefit of putting filter queries into the pre-parsed query cache.
      #
      # @param [Numeric] i The index at which to detect the token
      # @param [String] query The string query
      # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
      def self.read_ahead_filter_query(i, query)
        ch = query[i,1]
        if(ch == ATOM_FILTER_QUERY_START)
          j = i+1; depth = 1; query_token = "";
          
          while(depth > 0) do
            ch = query[j,1]
            if(j > query.length)
              raise Spah::SpahQL::Errors::CompilerError.new(
                     j, query, 
                     "Found unexpected EOL, expected ATOM_FILTER_QUERY_END. (Bracket depth: #{depth})"
                     )
            elsif(ch == ATOM_FILTER_QUERY_START)
              depth += 1; query_token << ch; j += 1;
            elsif(ch == ATOM_FILTER_QUERY_END)
              depth -= 1; query_token << ch; j += 1;
            elsif(string_result = read_ahead_string_literal(j, query))
              # String literals - we use the internal string reader as it will ignore any square brackets within the quote marks.
              # The resume index is used to bulk-append the characters to the query token
              query_token += query[j..string_result[0]]
              j = string_result[0]
            else
              # Regular append
              query_token << ch
              j += 1
            end
          end#while: depth
          
          if(query_token.length > 1) # query token includes final closing bracket
             return [j, parse_query(query_token[0, query_token.length-1])];
          else
           raise Spah::SpahQL::Errors::CompilerError.new(
                 j, query, 
                 "Found unexpected ATOM_FILTER_QUERY_END, expected TOKEN_SELECTION_QUERY or TOKEN_ASSERTION_QUERY. Looked like those brackets were empty - make sure they have a query in them."
                 )
          end#if: token length
          
        end#if: token match
        # No match
        return nil
      end
      
      # Detects a set literal at the given index in the given string query.
      # A set literal is composed of one or more string literals, numeric literals, boolean literals
      # or selection queries wrapped in the ATOM_SET_START and ATOM_SET_END character atoms. 
      # 
      # Within the set, selection queries are parsed and cached using parse_query. The ATOM_SET_ARRAY_DELIMITER
      # is used to separate values. Alternatively the ATOM_SET_RANGE_DELIMITER may be used to create a macro or
      # "range" set containing a numeric or alphabetic range. The two types of delimiters may not be mixed.
      #
      # @param [Numeric] i The index at which to detect the token
      # @param [String] query The string query
      # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
      def self.read_ahead_set_literal(i, query)
        
      end
      
      # Reads ahead for alphanumeric, underscore and hyphen characters
      def self.read_ahead_inline_variable_reference(i, query)
         valid = /[\w\d_-]/; j=i; token = "";
         m = nil
         while(m = query[j,1].match(valid)) do
           token += m[0]
           j += 1
         end#while
         return (token.length > 0)? [j, token] : nil;
      end
      
    end
  end
end