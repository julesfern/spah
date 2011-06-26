#!/usr/bin/env ruby
require 'sinatra'

set :public, File.join(File.dirname(__FILE__))

get "/" do
  redirect "/client/tests"
end
get "/client/tests" do
  redirect '/client/test/all-tests.html'
end