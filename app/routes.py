from flask import Blueprint, render_template, current_app
import xmlrpc.client

main = Blueprint('main', __name__)

@main.route('/')
def admin_panel():
    return render_template('dashboard.html')

@main.route('/admin')
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
                              {})
    return render_template('admin_panel.html', tasks=tasks)