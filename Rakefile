require 'bundler/setup'
Bundler.require

namespace :db do
  task :init do
    DB = Sequel.connect(ENV['DATABASE_URL'] || 'sqlite://my.db')
  end

  desc 'drop all'
  task :drop_all => :init do
    DB.tables.each do |table|
      DB.drop_table table
    end
  end

  desc 'create all'
  task :create_all => :init do
    DB.create_table? :users do
      primary_key :id
      Integer :twitter_id
      String :name
      Time :created_at
    end
    DB.add_index :users, :twitter_id, :ignore_errors => true

    DB.create_table? :favorites do
      primary_key :id
      Integer :code
      Integer :user_id
      Time :created_at
    end
    DB.add_index :favorites, :code, :ignore_errors => true
    DB.add_index :favorites, :user_id, :ignore_errors => true
    DB.add_index :favorites, [:code, :user_id], :unique => true, :ignore_errors => true

    DB.create_table? :histories do
      primary_key :id
      Integer :code
      Integer :views
    end
    DB.add_index :histories, :code, :ignore_errors => true
  end
end
