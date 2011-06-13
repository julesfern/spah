module Spah
  module SpahQL
    
    # The result of running a string query through Spah::SpahQL::QueryParser.parse_query.
    # May be handed to the QueryRunner for execution against a dataset.
    class Query
      
      # Instantiates a new Query instance with the given raw string.
      def initialize(raw_string)
        @raw_string = raw_string
      end
      
      # The string from which this query was parsed.
      attr_reader :raw_string
      
    end
  end
end