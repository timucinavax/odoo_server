from flask import Blueprint, render_template, current_app
import xmlrpc.client

main = Blueprint('main', __name__)

@main.route('/')
def index():
    url = current_app.config['ODOO_URL']
    db = current_app.config['ODOO_DB']
    username = current_app.config['ODOO_USERNAME']
    password = current_app.config['ODOO_PASSWORD']

    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, password, {})

    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
    partners = models.execute_kw(db, uid, password,
                                 'res.partner', 'search_read',
                                 [[]], {'fields': ['name', 'email'], 'limit': 10})
    
    return render_template('index.html', partners=partners)
