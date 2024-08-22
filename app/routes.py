from functools import wraps
from flask import render_template, request, redirect, url_for, current_app, flash, session
import xmlrpc.client
from werkzeug.security import generate_password_hash, check_password_hash
from app import app
from datetime import datetime, timedelta

def odoo_connect():
    url = current_app.config['ODOO_URL']
    db = current_app.config['ODOO_DB']
    admin_username = current_app.config['ODOO_USERNAME']
    admin_password = current_app.config['ODOO_PASSWORD']

    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common', allow_none=True)
    uid = common.authenticate(db, admin_username, admin_password, {})

    if uid:
        models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object', allow_none=True)
        return uid, models
    else:
        flash("Odoo bağlantısı sağlanamadı.")
        return None, None

def generate_dates_for_month(year, month):
    start_date = datetime(year, month, 1)
    next_month = start_date.replace(day=28) + timedelta(days=4)  # Sonraki aya geçiş
    end_date = next_month - timedelta(days=next_month.day)  # Bu ayın son günü
    current_date = start_date
    dates = []

    while current_date <= end_date:
        dates.append(current_date)
        current_date += timedelta(days=1)

    return dates

from datetime import datetime
import calendar

def format_dates(dates):
    formatted_dates = []
    for date in dates:
        formatted_dates.append({
            'day': date.day,
            'weekday': calendar.day_name[date.weekday()],
            'date': date
        })
    return formatted_dates

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'role' not in session or session['role'] not in allowed_roles:
                flash("Bu sayfaya erişim izniniz yok.")
                return redirect(url_for('dashboard'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@app.route('/')
@app.route('/home')
def dashboard():
    logged_in_user = session.get('username')
    logged_in_user_role = session.get('role')
    
    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for('dashboard'))

    flights = models.execute_kw(current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'],
                                'flight.management', 'search_read', [[]], 
                                {'fields': ['flight_direction','flight_number', 'available_seats', 'departure_airport', 'arrival_airport', 'departure_time']})

    outbound_flights = [flight for flight in flights if flight['flight_direction'] == 'outbound']
    return_flights = [flight for flight in flights if flight['flight_direction'] == 'return']

    return render_template('dashboard.html', 
                           outbound_flights=outbound_flights, 
                           return_flights=return_flights,
                           logged_in_user=logged_in_user,
                           logged_in_user_role=logged_in_user_role)

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    role = request.form.get('role')

    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for('dashboard'))

    user = models.execute_kw(current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'],
                             'custom.user', 'search_read', [[('username', '=', username), ('role', '=', role)]], {'limit': 1})

    if user:
        stored_password_hash = user[0]['password']
        if check_password_hash(stored_password_hash, password):
            session['username'] = username
            session['role'] = role
            if role == 'admin':
                return redirect(url_for('admin_panel'))
            else:
                return redirect(url_for('ticketbuy'))
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

    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for('dashboard'))

    user_id = models.execute_kw(current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'], 
                                'custom.user', 'create', [{
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

@app.route('/admin')
@role_required(['admin'])
def admin_panel():
    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for('dashboard'))

    flights = models.execute_kw(current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'], 
                                'flight.management', 'search_read', [[]], 
                                {'fields': ['flight_direction', 'flight_number', 'svc_type', 'date', 'available_seats', 'departure_airport', 'arrival_airport', 'departure_time']})
    
    outbound_flights = [flight for flight in flights if flight['flight_direction'] == 'outbound']
    return_flights = [flight for flight in flights if flight['flight_direction'] == 'return']

    users = models.execute_kw(current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'], 
                              'custom.user', 'search_read', [[]], {'fields': ['username', 'email', 'role']})

    return render_template('admin_panel.html', outbound_flights=outbound_flights, return_flights=return_flights, users=users)

@app.route('/add_flight', methods=['POST'])
@role_required(['admin'])
def add_flight():
    flight_code = request.form.get('flight_code')
    departure = request.form.get('departure')
    arrival = request.form.get('arrival')
    departure_time = request.form.get('departure_time')
    arrival_time = request.form.get('arrival_time')
    price = request.form.get('price')
    flight_direction = request.form.get('flight_direction')
    airplane_type_name = request.form.get('airplane_type')
    svc_type = request.form.get('svc_type')
    date = request.form.get('date')

    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for('admin_panel'))

    airplane_type = models.execute_kw(current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'], 
                                      'airplane.type', 'search_read', [[('name', '=', airplane_type_name)]], 
                                      {'fields': ['id', 'seat_count'], 'limit': 1})

    if not airplane_type:
        flash('Geçersiz uçak tipi.')
        return redirect(url_for('admin_panel'))
    
    airplane_type_id = airplane_type[0]['id']

    flight_id = models.execute_kw(current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'], 
                                  'flight.management', 'create', [{
                                      'flight_number': flight_code,
                                      'available_seats': airplane_type[0]['seat_count'],
                                      'departure_airport': departure,
                                      'arrival_airport': arrival,
                                      'departure_time': departure_time,
                                      'arrival_time': arrival_time,
                                      'price': price,
                                      'flight_direction': flight_direction, 
                                      'airplane_type_id': airplane_type_id,
                                      'svc_type': svc_type,
                                      'date': date,
                                      'user_id': False,
                                  }])

    if flight_id:
        flash('Flight added successfully.')
    else:
        flash('An error occurred while adding the flight.')

    return redirect(url_for('admin_panel'))

@app.route('/ticketbuy')
def ticketbuy():
    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for('dashboard'))

    # Tüm aylar için uçuş bilgilerini çekiyoruz
    flights = models.execute_kw(
        current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'], 
        'flight.management', 'search_read', [[]], 
        {'fields': ['departure_time', 'departure_airport', 'arrival_airport', 'price']}
    )

    # Tarih ve fiyat bilgilerini organize ediyoruz
    date_flight_map = {}
    for flight in flights:
        flight_date = flight['departure_time'].split(' ')[0]  # 'YYYY-MM-DD' formatında tarih alınıyor
        if flight_date not in date_flight_map:
            date_flight_map[flight_date] = []
        date_flight_map[flight_date].append(flight)
    
    # Tarihlere göre ilk uçuşun fiyatını belirliyoruz
    date_prices = {
        date: min(flight['price'] for flight in flights) for date, flights in date_flight_map.items()
    }

    return render_template(
        'ticketbuy.html',
        dates=list(date_prices.keys()),
        date_prices=date_prices,
        flights=flights
    )

@app.route('/plane_layout/<int:flight_id>', methods=['GET'])
@role_required(['admin'])
def plane_layout(flight_id):
    
    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for('dashboard'))

    flight = models.execute_kw(current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'] , 'flight.management', 'read', [[flight_id]], {'fields': ['flight_number', 'airplane_type_id', 'seat_ids']})

    if not flight:
        flash('Flight not found.')
        return redirect(url_for('admin_panel'))
    airplane_type_name = flight[0]['airplane_type_id'][1]

    # Fetch all seats
    seats = models.execute_kw(current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'] , 'flight.seat', 'search_read', [[('flight_id', '=', flight_id)]], {'fields': ['id', 'name', 'user_id']})

    # Render the plane layout template
    return render_template('plane_rev.html', airplane_type=airplane_type_name, seats=seats)

@app.route('/search_flights', methods=['POST'])
def search_flights():
    flight_direction = request.form.get('flight_direction')
    from_where = request.form.get('from_where')
    to_where = request.form.get('to_where')
    flight_date = request.form.get('flight_date')

    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for('dashboard'))
    
    domain = [
        ('departure_airport', '=', from_where),
        ('arrival_airport', '=', to_where),
        ('departure_time', '>=', f'{flight_date} 00:00:00'),
        ('departure_time', '<=', f'{flight_date} 23:59:59')
    ]

    if flight_direction == 'outbound':
        domain.append(('flight_direction', '=', 'outbound'))
        outbound_flights = models.execute_kw(current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'] ,'flight.management', 'search_read', [domain], 
                                {'fields': ['flight_number', 'available_seats', 'departure_airport', 'arrival_airport', 'departure_time']})
        return_flights = []
    else:
        domain.append(('flight_direction', '=', 'return'))
        return_flights = models.execute_kw(current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'] ,'flight.management', 'search_read', [domain], 
                                {'fields': ['flight_number', 'available_seats', 'departure_airport', 'arrival_airport', 'departure_time']})
        outbound_flights = []

    return render_template('index.html', outbound_flights=outbound_flights, return_flights=return_flights)


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('dashboard'))

@app.route('/support')
def support():
    return render_template('support.html')

@app.route('/offer')
def offer():
    return render_template('offer.html')

@app.route('/travel')
def travel():
    return render_template('travel.html')

@app.route('/agency')
@role_required(['agency'])
def agency_panel():
    return render_template('agency_panel.html')

@app.route('/sign')
def sign():
    return render_template('sign.html')
