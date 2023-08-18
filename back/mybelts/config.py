from os import environ

PGUSER = environ.get('PGUSER', 'mybelts')
PGPASSWORD = environ.get('PGPASSWORD', 'mybelts')
PGHOST = environ.get('PGHOST', 'localhost')
PGPORT = environ.get('PGPORT', '5432')
PGSCHEMA = environ.get('PGSCHEMA', 'mybelts')

POSTGRES_URI = f'postgresql+psycopg2://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGSCHEMA}'

SECRET = 'some_secret'
