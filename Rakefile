require 'bundler/setup'
require "rspec/core/rake_task"

RSpec::Core::RakeTask.new(:spec)

task :default => :spec

desc "bundle"
task :init do
  sh "bundle install --path vendor/bundle --binstubs=vendor/bin"
end

desc "make recipe file"
task :recipe do
  sh "ruby recipes.rb jp >html/recipes/base/0.12.1/ja.json"
  sh "ruby recipes.rb en >html/recipes/base/0.12.1/en.json"
end

desc "deploy Github pages"
task :deploy do
  cd 'tmp' do
     sh "git clone git https://github.com/nak1114/Factorio_tree.git"
     sh "git checkout --orphan gh-pages"
     sh "del *"
     sh "rmdir /s /q spec"
     sh "xcopy html\\* .\\ /E /H /R /K /Y /I /F"
     sh "rmdir /s /q html"
  end
end
