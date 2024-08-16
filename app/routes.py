from flask import render_template, current_app
import xmlrpc.client
from app import app

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/admin')
def admin_panel():
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