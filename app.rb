# encoding: UTF-8

require 'bundler/setup'
Bundler.require(:default, :development)

DB = Sequel.connect(ENV['DATABASE_URL'] || 'sqlite://my.db')

use Rack::Session::Cookie
# NOTE: heroku config:add TWITTER_CONSUMER_KEY=xxxxxxxxx TWITTER_CONSUMER_SECRET=xxxxxxxxxxx
use OmniAuth::Strategies::Twitter, ENV['TWITTER_CONSUMER_KEY'], ENV['TWITTER_CONSUMER_SECRET']

before do
  validates_code
end

get '/' do
  haml :index
end

get '/auth/:name/callback' do
  auth = request.env['omniauth.auth']
  dataset = DB[:users].filter('twitter_id = ?', auth["uid"])
  if dataset.empty?
    DB[:users].insert(:twitter_id => auth["uid"], :name => auth["user_info"]["nickname"])
  end
  user = dataset.first
  session[:user_id] = user[:id]
  redirect request.env['omniauth.origin']
end

get '/logout' do
  session.delete(:user_id)
  redirect '/'
end

get '/:code' do
  @code16 = params[:code]
  @code = @code16.to_i(16)
  @char = @code.chr('utf-8')
  @favs = DB[:favorites].filter('code = ?', @code)
  @fav = @favs.filter('user_id = ?', current_user[:id]).count > 0 if current_user
  @favs = @favs.join(:users, :id => :user_id)

  haml :show
end

get '/:code/fav' do
  unless current_user
    haml :please_login
  else
    DB[:favorites].insert(:user_id => current_user[:id], :code => params[:code].to_i(16))
    redirect "/#{params[:code]}"
  end
end

get '/:code/unfav' do
  unless current_user
    haml :please_login
  else
    DB[:favorites].filter(:user_id => current_user[:id], :code => params[:code].to_i(16)).delete
    redirect "/#{params[:code]}"
  end
end

helpers do
  include Haml::Helpers

  def current_user
    return false if @current_user == false
    unless @current_user = DB[:users].filter('id = ?', session[:user_id]).first
      @current_user = false
    end
    @current_user
  end

  def validates_code
    return unless params[:code]
    halt 404 unless params[:code] =~ /^[0-9a-f]+$/i
  end

  def user_link(user, size = :n)
    haml_tag :a, :href => "/u/#{user[:name]}" do
      haml_tag :img, :src => "http://img.tweetimag.es/i/#{user[:name]}_#{size}"
    end
  end
end
