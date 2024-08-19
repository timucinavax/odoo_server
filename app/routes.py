from flask import render_template, request, redirect, url_for, current_app, flash
import xmlrpc.client
from werkzeug.security import generate_password_hash, check_password_hash
from app import app

@app.route('/')
@app.route('/home')
def dashboard():
    return render_template('dashboard.html')

@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    username = request.form.get('username')
    password = request.form.get('password')
    role = request.form.get('role')

    url = current_app.config['ODOO_URL']
    db = current_app.config['ODOO_DB']

    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, current_app.config['ODOO_USERNAME'], current_app.config['ODOO_PASSWORD'], {})

    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

    user = models.execute_kw(db, uid, current_app.config['ODOO_PASSWORD'], 'custom.user', 'search_read', [[('email', '=', email), ('username', '=', username), ('role', '=', role)]], {'limit': 1})

    if user:
        stored_password_hash = user[0]['password']
        if check_password_hash(stored_password_hash, password):
            if role == 'admin':
                return redirect(url_for('admin_panel'))
            elif role == 'user':
                return redirect(url_for('user_panel'))
            elif role == 'agency':
                return redirect(url_for('agency_panel'))
        else:
            flash("Hatalı şifre, lütfen tekrar deneyin.")
    else:
        flash("Kullanıcı bulunamadı.")
    return redirect(url_for('dashboard'))

@app.route('/register', methods=['POST'])
def register():
    email = request.form.get('email')
    username = request.form.get('username')
    password = request.form.get('password')
    role = request.form.get('role')

    hashed_password = generate_password_hash(password)

    url = current_app.config['ODOO_URL']
    db = current_app.config['ODOO_DB']
    admin_username = current_app.config['ODOO_USERNAME']
    admin_password = current_app.config['ODOO_PASSWORD']

    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, admin_username, admin_password, {})

    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

    user_id = models.execute_kw(db, uid, admin_password, 'custom.user', 'create', [{
        'email': email,
        'username': username,
        'password': hashed_password,
        'role': role,
    }])

    if user_id:
        flash("Kayıt başarılı. Giriş yapabilirsiniz.")
        return redirect(url_for('dashboard'))
    else:
        flash("Kayıt sırasında bir hata oluştu.")
        return redirect(url_for('dashboard'))

@app.route('/add_flight', methods=['POST'])
def add_flight():
    flight_code = request.form.get('flight_code')
    passenger_count = request.form.get('passenger_count')
    departure = request.form.get('departure')
    arrival = request.form.get('arrival')
    departure_time = request.form.get('departure_time')
    arrival_time = request.form.get('arrival_time')
    price = request.form.get('price')

    url = current_app.config['ODOO_URL']
    db = current_app.config['ODOO_DB']
    admin_username = current_app.config['ODOO_USERNAME']
    admin_password = current_app.config['ODOO_PASSWORD']

    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, admin_username, admin_password, {})

    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

    flight_id = models.execute_kw(db, uid, admin_password, 'flight.management', 'create', [{
        'flight_number': flight_code,
        'available_seats': passenger_count,
        'departure_airport': departure,
        'arrival_airport': arrival,
        'departure_time': departure_time,
        'arrival_time': arrival_time,
        'price': price,
        'user_id': False,  
    }])

    if flight_id:
        flash('Uçuş başarıyla eklendi.')
    else:
        flash('Uçuş eklenirken bir hata oluştu.')

    return redirect(url_for('admin_panel'))

@app.route('/admin')
def admin_panel():
    url = current_app.config['ODOO_URL']
    db = current_app.config['ODOO_DB']
    admin_username = current_app.config['ODOO_USERNAME']
    admin_password = current_app.config['ODOO_PASSWORD']

    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, admin_username, admin_password, {})

    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

    flights = models.execute_kw(db, uid, admin_password, 'flight.management', 'search_read', [[]], {'fields': ['flight_number', 'available_seats', 'departure_airport', 'arrival_airport', 'departure_time']})

    users = models.execute_kw(db, uid, admin_password, 'custom.user', 'search_read', [[]], {'fields': ['username', 'email', 'role']})

    return render_template('admin_panel.html', flights=flights, users=users)

@app.route('/user')
def user_panel():
    return render_template('user_panel.html')

@app.route('/agency')
def agency_panel():
    return render_template('agency_panel.html')

@app.route('/plane_rev')
def plane_rev():
    return render_template('plane_rev.html')

@app.route('/sign')
def sign():
    return render_template('sign.html')
