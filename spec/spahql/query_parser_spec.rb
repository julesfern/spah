describe Spah::SpahQL::QueryParser do
  
  it "Returns the correct structure when parsing full queries" do
    s = "/foo//bar/.property/baz[$//bar]"
    q = Spah::SpahQL::QueryParser.parse_query(s);
    q.primary_token.should ==  Spah::SpahQL::Token::SelectionQuery.parse_at(0, s)[1]
    q.comparison_operator.should be_nil
    q.secondary_token.should be_nil
    q.assertion.should be_false
  end
  
  it "Parses a flat root query" do
    q = Spah::SpahQL::QueryParser.parse_query("/");
    q.primary_token.should ==  Spah::SpahQL::Token::SelectionQuery.parse_at(0, "/")[1]
    q.comparison_operator.should be_nil
    q.secondary_token.should be_nil
    q.assertion.should be_false
  end
  
end