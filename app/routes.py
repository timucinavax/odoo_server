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

    tasks = models.execute_kw(db, uid, password,
                              'project.task', 'search_read',
                              [[]], 
                              {'fields': ['name', 'stage_id', 'assigned_to'], 'limit': 10})
    
    # HTML şablonuna görevleri geçir
    return render_template('index.html', tasks=tasks)