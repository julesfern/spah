describe Spah::SpahQL::Token::Boolean do
  
  it "Returns a correct new index and found string when reading ahead tokens" do
    res = Spah::SpahQL::Token::Boolean.parse_at(12, '{3, "true", true}')
    res[0].should == 16
    res[1].value.should be_true
    
    res = Spah::SpahQL::Token::Boolean.parse_at(12, '{3, "true", false}')
    res[0].should == 17
    res[1].value.should be_false
    
    Spah::SpahQL::Token::Boolean.parse_at(12, '{3, "true", "false"}').should be_nil
  end
  
end