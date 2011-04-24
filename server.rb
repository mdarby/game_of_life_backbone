require 'rubygems'
require 'sinatra'
require 'haml'
require 'sass'
require 'date'

configure do
  set :haml, { :format => :html5 }
  set :sass, { :style => :compact }
end

get '/' do
  haml :index
end

get '/stylesheet.css' do
  content_type 'text/css', :charset => 'utf-8'
  sass :stylesheet
end

not_found do
  redirect '/'
end
