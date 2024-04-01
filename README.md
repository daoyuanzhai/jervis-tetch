### .env file

Create a .env file that has the following envs:

```
RABBITMQ_HOST=localhost
RABBITMQ_URL=http://localhost:15672/api
RABBITMQ_ERLANG_COOKIE=some_cookie_value
RABBITMQ_DEFAULT_USER=username_to_login_webui
RABBITMQ_DEFAULT_PASS=password_to_login_webui
EXPRESS_PORT=3000
```

where the `RABBITMQ_ERLANG_COOKIE` is generated using:

```
openssl rand -base64 24
```
