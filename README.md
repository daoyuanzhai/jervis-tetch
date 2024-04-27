### .env file

Create a .env file that has the following envs:

```
MYSQL_ROOT_PASSWORD=password_you_would_like_for_your_mysql
MYSQL_DATABASE=lago_dev_for_example
MYSQL_USER=admin_username_you_would_like_for_your_mysql
MYSQL_PASSWORD=admin_password_you_would_like_for_your_mysql

RABBITMQ_HOST=localhost
RABBITMQ_ERLANG_COOKIE=some_cookie_value
RABBITMQ_DEFAULT_USER=admin_username_to_login_webui
RABBITMQ_DEFAULT_PASS=admin_password_to_login_webui

QDRANT_API_KEY=your_qdrant_sky_key

OPENAI_API_KEY=your_openai_api_key

LAGO_MYSQL_DB=lago_dev_for_example
LAGO_MYSQL_USERNAME=username_for_mysql
LAGO_MYSQL_PASSWORD=password_for_mysql

LAGO_RABBITMQ_USER=lago_username
LAGO_RABBITMQ_PASS=lago_password

SECRET_KEY=hono_app_jwt_key
```

where the `RABBITMQ_ERLANG_COOKIE` can be generated using:

```
openssl rand -base64 24
```
and, similarly, the `QDRANT_API_KEY` and `SECRET_KEY` can be generated by:
```
openssl rand -base64 32
```
### Rabbit MQ
Once RabbitMQ is up and running:
- Create username/password for `Lago` to be able to subscribe/publish messages.
- Run `bun run apply-rabbitmq` to setup all rabbitmq configs (exchanges, queues, bindings and etc).
### Jervis Tetch
- Update the `createPowerUserList.js` file to contain the power user credentials.
- Run `bun run create-power-users` to create the `credentials.json` file.
- Remember to undo the changes in `createPowerUserList.js` to avoid giving away the credentials into git.
- Build the image `docker build -t jervis-tetch:0.01 .`
### Mysql and Qdrant
See Lago [README.md](https://github.com/daoyuanzhai/lago/blob/main/README.md)