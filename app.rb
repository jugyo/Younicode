# encoding: UTF-8

require 'bundler/setup'
Bundler.require(:default, :development)

DB = Sequel.connect(ENV['DATABASE_URL'] || 'sqlite://my.db')

use Rack::Session::Cookie
# NOTE: heroku config:add TWITTER_CONSUMER_KEY=xxxxxxxxx TWITTER_CONSUMER_SECRET=xxxxxxxxxxx
use OmniAuth::Strategies::Twitter, ENV['TWITTER_CONSUMER_KEY'], ENV['TWITTER_CONSUMER_SECRET']

get '/' do
  @favs = DB[:favorites].join(:users, :id => :user_id).order(:created_at.qualify(:favorites).desc).limit(70)
  @histories = DB[:histories].order(:updated_at.desc).limit(180)
  haml :index
end

get '/:code' do
  pass unless valid_code(params[:code])

  @code16 = params[:code]
  @code = @code16.to_i(16)

  record_history(@code)

  @char = @code.chr('utf-8')
  @char = '&nbsp;' unless @char.valid_encoding?

  @favs = DB[:favorites].filter('code = ?', @code)
  @fav = @favs.filter('user_id = ?', current_user[:id]).count > 0 if current_user
  @favs = @favs.join(:users, :id => :user_id)
  haml :show
end

get '/:code/fav' do
  pass unless valid_code(params[:code])

  unless current_user
    haml :about_sign_in
  else
    DB[:favorites].insert(
      :user_id => current_user[:id],
      :code => params[:code].to_i(16),
      :created_at => Time.now
    )
    redirect "/#{params[:code]}"
  end
end

get '/:code/unfav' do
  pass unless valid_code(params[:code])

  unless current_user
    haml :about_sign_in
  else
    DB[:favorites].filter(:user_id => current_user[:id], :code => params[:code].to_i(16)).delete
    redirect "/#{params[:code]}"
  end
end

get '/auth/:name/callback' do
  auth = request.env['omniauth.auth']
  dataset = DB[:users].filter('twitter_id = ?', auth["uid"])
  if dataset.empty?
    DB[:users].insert(
      :twitter_id => auth["uid"],
      :name => auth["user_info"]["nickname"],
      :created_at => Time.now
    )
  end
  user = dataset.first
  session[:user_id] = user[:id]
  redirect request.env['omniauth.origin']
end

get '/logout' do
  session.delete(:user_id)
  redirect request.env['HTTP_REFERER'] || '/'
end

get '/about/sign_in' do
  haml :about_sign_in
end

get '/u/:name' do
  @user = DB[:users].filter('name = ?', params[:name]).first
  halt 404 unless @user
  @favs = DB[:favorites].filter('user_id = ?', @user[:id]).order(:code)
  haml :user
end

get '/search' do
  char = params[:char][0]
  redirect "/#{char.ord.to_s(16)}"
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

  def valid_code(code)
    code =~ /^[0-9a-f]+$/i
  end

  def user_link(user, options = {})
    capture_haml do
      haml_tag :a, :href => "/u/#{user[:name]}", :class => 'user-link' do
        if options[:image]
          haml_tag :img, :src => "http://img.tweetimag.es/i/#{user[:name]}_#{options[:image]}", :class => 'user-icon'
        end
        if options[:show_name]
          haml_concat user[:name]
        end
      end
    end
  end

  def char_link(code)
    capture_haml do
      haml_tag :a, :href => "/#{code.to_s(16)}", :class => 'char-link' do
        char = code.chr('utf-8')
        haml_concat char if char.valid_encoding?
      end
    end
  end

  def record_history(code)
    dataset = DB[:histories].filter('code = ?', code)
    if history = dataset.first
      dataset.update(:views => history[:views] + 1, :updated_at => Time.now)
    else
      DB[:histories].insert(:code => code, :views => 1, :updated_at => Time.now)
    end
  end
end
