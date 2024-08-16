from flask import Flask
from app.routes import main

def create_app():
    app = Flask(__name__)
    
    app.config['ODOO_URL'] = 'http://217.160.138.215:8447'
    app.config['ODOO_DB'] = 'odoo_db'
    app.config['ODOO_USERNAME'] = 'admin'
    app.config['ODOO_PASSWORD'] = 'admin'

    app.register_blueprint(main)

    return app
