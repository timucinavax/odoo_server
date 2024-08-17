from flask import render_template, request, redirect, url_for, current_app, flash
import xmlrpc.client
from app import app

@app.route('/')
@app.route('/home')
def dashboard():
    return render_template('dashboard.html')

@app.route('/login', methods=['POST'])
def login():
    role = request.form.get('role')
    username = request.form.get('username')
    password = request.form.get('password')

    url = current_app.config['ODOO_URL']
    db = current_app.config['ODOO_DB']
    
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, password, {})

    if uid:
        models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
        user_id = models.execute_kw(db, uid, password, 'custom.user', 'search', [
            [('login', '=', username), ('password', '=', password), ('role', '=', role)]
        ])
        if user_id:
            if role == 'admin':
                return redirect(url_for('admin_panel'))
            elif role == 'user':
                return redirect(url_for('user_panel'))
            elif role == 'agency':
                return redirect(url_for('agency_panel'))
        else:
            flash("Giriş bilgileri hatalı, lütfen tekrar deneyin.")
    else:
        flash("Giriş sırasında bir hata oluştu.")
    
    return redirect(url_for('dashboard'))

@app.route('/register', methods=['POST'])
def register():
    role = request.form.get('role')
    name = request.form.get('name')
    username = request.form.get('username')
    password = request.form.get('password')

    url = current_app.config['ODOO_URL']
    db = current_app.config['ODOO_DB']
    admin_username = current_app.config['ODOO_USERNAME']
    admin_password = current_app.config['ODOO_PASSWORD']

    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, admin_username, admin_password, {})

    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

    # Kullanıcı oluşturma
    user_id = models.execute_kw(db, uid, admin_password, 'custom.user', 'create', [{
        'name': name,
        'login': username,
        'password': password,
        'role': role,
    }])

    if user_id:
        flash("Kayıt başarılı. Giriş yapabilirsiniz.")
        return redirect(url_for('dashboard'))
    else:
        flash("Kayıt sırasında bir hata oluştu.")
        return redirect(url_for('dashboard'))

@app.route('/admin')
def admin_panel():
    url = current_app.config['ODOO_URL']
    db = current_app.config['ODOO_DB']
    username = current_app.config['ODOO_USERNAME']
    password = current_app.config['ODOO_PASSWORD']

    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, password, {})

    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

    tasks = models.execute_kw(db, uid, password, 'project.task', 'search_read', [[]], {})
    return render_template('admin_panel.html', tasks=tasks)

@app.route('/user')
def user_panel():
    return render_template('user_panel.html')

@app.route('/agency')
def agency_panel():
    return render_template('agency_panel.html')