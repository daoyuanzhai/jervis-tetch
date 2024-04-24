### .env file

Create a .env file that has the following envs:

```
RABBITMQ_HOST=localhost
RABBITMQ_ERLANG_COOKIE=some_cookie_value
RABBITMQ_DEFAULT_USER=username_to_login_webui
RABBITMQ_DEFAULT_PASS=password_to_login_webui
SECRET_KEY=hono_app_jwt_key
```

where the `RABBITMQ_ERLANG_COOKIE` is generated using:

```
openssl rand -base64 24
```
and the `SECRET_KEY` is using similar command:
```
openssl rand -base64 32
```