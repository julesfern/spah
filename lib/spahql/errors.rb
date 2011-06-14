module Spah
  module SpahQL
    module Errors
      
      
      # An error triggered while parsing a SpahQL query.
      class CompilerError < ::RuntimeError
        
        # Create a new CompilerError
        # @param [Numeric] index The index in the parsed string at which the error was encountered
        # @param [String] query The string query which triggered the error during parsing
        # @param [String] message Message regarding the specific error encountered.
        def initialize(index, query, message)
          @index = index
          @query = query
          super "#{message} (at index #{index} in query #{query.inspect})"
        end
        
        # Returns the index in the query string at which the error was generated
        # @return [Numeric] The index in the query string at which the error was generated
        def index
          @index
        end
        
        # Returns the query string which generated the error
        # @return [String] The query string which generated the error
        def query
          @query
        end
        
      end#class CompilerError
      
      # An error triggered while executing a SpahQL query
      class RunnerError < ::RuntimeError
      end#class RunnerError
      
    end
  end
end