# server-based syntax
# ======================
# Defines a single server with a list of roles and multiple properties.
# You can define all roles on a single server, or split them:

server '134.34.205.176',
       user: 'devuser',
       roles: %w{app},
       ssh_options: { port:4422 }
# server 'example.com', user: 'deploy', roles: %w{app web}, other_property: :other_value
# server 'db.example.com', user: 'deploy', roles: %w{db}



# role-based syntax
# ==================

# Defines a role with one or multiple servers. The primary server in each
# group is considered to be the first unless any  hosts have the primary
# property set. Specify the username and a domain or IP for the server.
# Don't use `:all`, it's a meta role.

# role :app, %w{deploy@example.com}, my_property: :my_value
# role :web, %w{user1@primary.com user2@additional.com}, other_property: :other_value
# role :db,  %w{deploy@example.com}



# Configuration
# =============
# You can set any configuration variable like in config/deploy.rb
# These variables are then only loaded and set in this stage.
# For available Capistrano configuration variables see the documentation page.
# http://capistranorb.com/documentation/getting-started/configuration/
# Feel free to add new variables to customise your setup.



# Custom SSH Options
# ==================
# You may pass any option but keep in mind that net/ssh understands a
# limited set of options, consult the Net::SSH documentation.
# http://net-ssh.github.io/net-ssh/classes/Net/SSH.html#method-c-start
#
# Global options
# --------------
#  set :ssh_options, {
#    keys: %w(/home/rlisowski/.ssh/id_rsa),
#    forward_agent: false,
#    auth_methods: %w(password)
#  }
#
# The server-based syntax can be used to override options:
# ------------------------------------
# server 'example.com',
#   user: 'user_name',
#   roles: %w{web app},
#   ssh_options: {
#     user: 'user_name', # overrides user setting above
#     keys: %w(/home/user_name/.ssh/id_rsa),
#     forward_agent: false,
#     auth_methods: %w(publickey password)
#     # password: 'please use keys'
#   }

namespace :deploy do
  task :build do
    on roles :app do
      within current_path do
        puts 'Installing node modules...'
        execute :yarn
      end
    end
  end

  task :symlink do
    on roles :app do
      within current_path.join('node_modules') do
        puts 'Setting app symlink...'
        execute :rm, 'app'
        execute :ln,  '-sf', current_path, 'app'
      end
    end
  end

  task :start do
    on roles(:app) do
      execute :sudo, :start, 'pds-node'
    end
  end

  task :stop do
    on roles(:app) do
      begin
        execute :sudo, :stop, 'pds-node'
      rescue StandardError => e
        info "Server stop failed. This probably means it wasn't running."
      end
    end
  end

  task :restart do
    invoke 'deploy:stop'
    invoke 'deploy:symlink'
    invoke 'deploy:start'
  end

end

after 'deploy:publishing', 'deploy:build'
after 'deploy:published', 'deploy:restart'

after 'deploy:rollback', 'deploy:build'
after 'deploy:rollback', 'deploy:restart'
