require 'bundler/setup'
Bundler.require

get '/' do
  haml :index
end

get '/:code' do
  haml :show
end
