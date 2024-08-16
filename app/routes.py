from flask import Flask, render_template, current_app
import xmlrpc.client

app = Flask(__name__)

app.config['ODOO_URL'] = 'http://217.160.138.215:8447'
app.config['ODOO_DB'] = 'odoo_db'
app.config['ODOO_USERNAME'] = 'admin'
app.config['ODOO_PASSWORD'] = 'admin'

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

if __name__ == '__main__':
    app.run(debug=True)