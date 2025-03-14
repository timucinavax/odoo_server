from flask import Flask
from babel.dates import format_datetime

app = Flask(__name__)

app.jinja_env.filters['format_datetime'] = lambda value: format_datetime(value, 'dd MMMM yyyy HH:mm', locale='tr_TR')
app.config.from_mapping(
    SECRET_KEY = 'abea3d1266569db8744a79ecdc36bee43d6a14d1',
    ODOO_URL='http://217.160.138.215:8447',
    ODOO_DB='odoo_db',
    ODOO_USERNAME='admin',
    ODOO_PASSWORD='admin'
)

from app import routes