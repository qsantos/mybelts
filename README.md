# Installing

## Python

- install Python 3.9 or later (`sudo apt install python3`)
- create a virtual environment (`python3 -m venv env`)
- activate the virtual environment (`source env/bin/activate`)
- install the Python packages (`pip install -r requirements.txt`)

## npm

- install Node and npm
- install the npm packages (`npm install`)

## PostgreSQL

- install PostgreSQL (`sudo apt install postgresql`)
- create a database `mybelts` with a user `skills` using password `skills`
- activate the virtual environment (`source env/bin/activate`)
- create tables in the database (`alembic upgrade head`)
- populate the tables (`./test-api`)

## Nginx

- install Nginx (`sudo apt install nginx`)
- add a new site configuration in `/etc/nginx/sites-available/mybelts`:
    ```
    server {
        listen 80 default_server;
        listen 127.0.0.1:80 default_server;
        server_name _;
        location /api {
            proxy_pass http://127.0.0.1:5000/api;
        }
        location / {
            proxy_pass http://127.0.0.1:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
    ```
- enable the site (`sudo ln -s /etc/nginx/sites-available/mybelts /etc/nginx/sites-enabled/`)
- reload Nginx (`sudo systemctl reload nginx`)

# Running

- start the system services (`sudo systemctl start nginx postgresql`)
- activate the Python virtual environment (`source env/bin/activate`)
- start the back-end (`FLASK_DEBUG=1 FLASK_APP=mybelts.api flask run`)
- start the front (`cd front; NODE_OPTIONS='--openssl-legacy-provider' BROWSER=none npm run start`)
- open the web app (`firefox http://127.0.0.1/`)
- login as `root` with password `root`

# Testing

```
flake8 .
mypy .
./test-api
cd front
npx eslint src/*tsx
```

# Developing

## Updating TypeScript Models for the API

Assuming the API is listening locally on port 80, run the following commands.

```
cd front
wget http://127.0.0.1/api/swagger.json -O - | python3 -m json.tool --sort-keys >swagger.json
npx openapi-typescript-codegen --input swagger.json --request request.ts -o src/api
rm -f swagger.json
```
