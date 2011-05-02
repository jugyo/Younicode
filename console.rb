require 'bundler/setup'
require 'sequel'

DB = Sequel.connect(ENV['DATABASE_URL'] || 'sqlite://my.db')

require 'irb'
IRB.start
