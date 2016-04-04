#require "bundler/gem_tasks"
require "rspec/core/rake_task"

RSpec::Core::RakeTask.new(:spec)

task :default => :spec

task :init do
  sh "bundle install --path vendor/bundle"
end

task :recipe do
  sh "ruby recipes.rb jp >html/recipes/core/0.12.1/ja.json"
  sh "ruby recipes.rb en >html/recipes/core/0.12.1/en.json"
end
