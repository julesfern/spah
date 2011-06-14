module Spah
  module SpahQL
    
    # The result of running a string query through Spah::SpahQL::QueryParser.parse_query.
    # May be handed to the QueryRunner for execution against a dataset.
    class Query
      
      # Instantiates a new Query instance with the given raw string.
      def initialize(raw_string)
        @raw_string = raw_string
        @assertion = false
      end
      
      # The string from which this query was parsed.
      attr_reader :raw_string
      
      # The left-hand (or only) token, either a set literal or a selection query
      attr_accessor :primary_token
      
      # The right-hand token, either a set literal or a selection query. Only present if there is a comparison operator also.
      attr_accessor :secondary_token
      
      # The comparison operator that should be used when evaluating the two tokens as an assertion
      attr_accessor :comparison_operator
      
      # A boolean flag set to indicate that this is an assertion-only query.
      attr_accessor :assertion
      
      # Sugary version of #assertion
      def assertion?
        assertion
      end
      
      # Equality helper
      def ==(other_query)
        (other_query.is_a?(self.class)) and 
        other_query.primary_token == self.primary_token and 
        other_query.comparison_operator == self.comparison_operator and
        other_query.secondary_token == self.secondary_token
      end
      
    end
  end
end