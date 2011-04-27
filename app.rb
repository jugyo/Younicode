require 'bundler/setup'
Bundler.require
require 'erb'

get '/' do
  erb :index
end
