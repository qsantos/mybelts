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

## Other Dependencies

`sudo apt install inkscape pdftk texlive-extra-utils texlive-latex-recommended`


# Running

- start the system services (`sudo systemctl start postgresql`)
- activate the Python virtual environment (`source env/bin/activate`)
- start the back-end (`FLASK_DEBUG=1 flask run`)
- start the front (`npm start`)
- login as `root` with password `root`

# Testing

```
flake8 .
mypy .
./test-api
npx eslint src/*tsx
```

# Developing

## Updating TypeScript Models for the API

Assuming the API is listening locally on port 80, just run `./refresh-api-schema`.
