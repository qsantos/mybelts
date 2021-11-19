from os import environ

PGUSER = environ.get('PGUSER', 'skills')
PGPASSWORD = environ.get('PGPASSWORD', 'skills')
PGHOST = environ.get('PGHOST', 'localhost')
PGPORT = environ.get('PGPORT', '5432')
PGSCHEMA = environ.get('PGSCHEMA', 'skills')

POSTGRES_URI = f'postgresql+psycopg2://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGSCHEMA}'

SECRET = 'some_secret'
