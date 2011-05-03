require 'bundler/setup'
Bundler.require

namespace :db do
  task :init do
    DB = Sequel.connect(ENV['DATABASE_URL'] || 'sqlite://my.db')
  end

  desc 'migrate'
  task :migrate => :init do
    DB.create_table? :chars do
      primary_key :id
      Integer :code, :unique => true
      Integer :view_count, :default => 0
    end
    DB.add_index :chars, :code, :unique => true, :ignore_errors => true

    DB.create_table? :users do
      primary_key :id
      Integer :twitter_id
      String :name
    end
    DB.add_index :users, :twitter_id, :ignore_errors => true

    DB.create_table? :histories do
      primary_key :id
      Integer :code
      Integer :user_id
    end
    DB.add_index :histories, :code, :ignore_errors => true
    DB.add_index :histories, :user_id, :ignore_errors => true

    DB.create_table? :favorites do
      primary_key :id
      Integer :code
      Integer :user_id
    end
    DB.add_index :favorites, :code, :ignore_errors => true
    DB.add_index :favorites, :user_id, :ignore_errors => true
    DB.add_index :favorites, [:code, :user_id], :unique => true, :ignore_errors => true
  end
end
