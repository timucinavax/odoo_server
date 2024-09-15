from functools import wraps
from flask import (
    jsonify,
    render_template,
    request,
    redirect,
    url_for,
    current_app,
    flash,
    session,
)
import xmlrpc.client
from werkzeug.security import generate_password_hash, check_password_hash
from app import app
from datetime import datetime, timedelta
import calendar
from collections import defaultdict

@app.template_filter("dayname")
def dayname_filter(date_str):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    return date_obj.strftime("%A")


@app.template_filter("monthname")
def monthname_filter(date_str):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    return date_obj.strftime("%B")

def odoo_connect():
    url = current_app.config["ODOO_URL"]
    db = current_app.config["ODOO_DB"]
    admin_username = current_app.config["ODOO_USERNAME"]
    admin_password = current_app.config["ODOO_PASSWORD"]

    common = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/common", allow_none=True)
    uid = common.authenticate(db, admin_username, admin_password, {})

    if uid:
        models = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/object", allow_none=True)
        return uid, models
    else:
        flash("Odoo bağlantısı sağlanamadı.")
        return None, None


def generate_dates_for_month(year, month):
    start_date = datetime(year, month, 1)
    next_month = start_date.replace(day=28) + timedelta(days=4)
    end_date = next_month - timedelta(days=next_month.day)
    current_date = start_date
    dates = []

    while current_date <= end_date:
        dates.append(current_date)
        current_date += timedelta(days=1)

    return dates


def format_dates(dates):
    formatted_dates = []
    for date in dates:
        formatted_dates.append(
            {
                "day": date.day,
                "weekday": calendar.day_name[date.weekday()],
                "date": date,
            }
        )
    return formatted_dates


def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if "role" not in session or session["role"] not in allowed_roles:
                flash("Bu sayfaya erişim izniniz yok.")
                return redirect(url_for("index"))
            return f(*args, **kwargs)

        return decorated_function

    return decorator


@app.route("/")
@app.route("/home")
def index():
    logged_in_user = session.get("username")
    logged_in_user_role = session.get("role")

    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for("index"))

    flights = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "flight.management",
        "search_read",
        [[]],
        {
            "fields": [
                "flight_direction",
                "flight_number",
                "available_seats",
                "departure_airport",
                "arrival_airport",
                "departure_time",
                "date",
            ]
        },
    )

    outbound_flights = [
        flight for flight in flights if flight["flight_direction"] == "outbound"
    ]
    return_flights = [
        flight for flight in flights if flight["flight_direction"] == "return"
    ]

    return render_template(
        "index.html",
        outbound_flights=outbound_flights,
        return_flights=return_flights,
        logged_in_user=logged_in_user,
        logged_in_user_role=logged_in_user_role,
        current_page="index",
    )


@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    role = request.form.get("role")

    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for("index"))

    user = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "custom.user",
        "search_read",
        [[("username", "=", username), ("role", "=", role)]],
        {"limit": 1},
    )

    if user:
        stored_password_hash = user[0]["password"]
        if check_password_hash(stored_password_hash, password):
            session["username"] = username
            session["role"] = role
            session["user_id"] = user[0]["id"] 

            if role == "admin":
                return redirect(url_for("admin"))
            else:
                return redirect(url_for("index"))
        else:
            flash("Hatalı şifre, lütfen tekrar deneyin.")
    else:
        flash("Kullanıcı bulunamadı.")
    return redirect(url_for("sign"))


@app.route("/register", methods=["POST"])
def register():
    email = request.form.get("email")
    username = request.form.get("username")
    password = request.form.get("password")
    role = request.form.get("role")

    hashed_password = generate_password_hash(password)

    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for("index"))

    user_id = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "custom.user",
        "create",
        [
            {
                "email": email,
                "username": username,
                "password": hashed_password,
                "role": role,
            }
        ],
    )

    if user_id:
        flash("Kayıt başarılı. Giriş yapabilirsiniz.")
        return redirect(url_for("sign"))
    else:
        flash("Kayıt sırasında bir hata oluştu.")
        return redirect(url_for("sign"))

@app.route("/admin")
@role_required(["admin"])
def admin():
    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for("index"))

    airports = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "airport",
        "search_read",
        [[]],
        {"fields": ["name", "code", "city", "country"]}
    )

    flights = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "flight.management",
        "search_read",
        [[]],
        {
            "fields": [
                "flight_direction",
                "flight_number",
                "svc_type",
                "aircraft_category",
                "airline_company",
                "chain_number",
                "available_seats",
                "departure_airport",
                "arrival_airport",
                "departure_time",
                "arrival_time",
                "date",
            ]
        },
    )

    users = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "custom.user",
        "search_read",
        [[]],
        {"fields": ["username", "email", "role"]},
    )

    outbound_flights = [
        flight for flight in flights if flight["flight_direction"] == "outbound"
    ]
    return_flights = [
        flight for flight in flights if flight["flight_direction"] == "return"
    ]

    grouped_flights = defaultdict(list)
    for flight in flights:
        grouped_flights[flight["chain_number"]].append(flight)

    return render_template(
        "admin.html",
        grouped_flights=grouped_flights,
        outbound_flights=outbound_flights,
        return_flights=return_flights,
        users=users,
        airports=airports,
        current_page="admin",
    )

@app.route("/add_flight", methods=["POST"])
@role_required(["admin"])
def add_flight():
    flight_code = request.form.get("flight_code")
    departure_id = request.form.get("departure")
    arrival_id = request.form.get("arrival")
    departure_time_str = request.form.get("departure_time")
    arrival_time_str = request.form.get("arrival_time")
    user_price = request.form.get("user_price")
    agency_price = request.form.get("agency_price")
    flight_direction = request.form.get("flight_direction")
    airplane_type_name = request.form.get("airplane_type")
    svc_type = request.form.get("svc_type")
    date_str = request.form.get("date")
    aircraft_category = request.form.get("aircraft_category")
    airline_company = request.form.get("airline_company")
    chain_number = request.form.get("chain_number")

    departure_time = datetime.strptime(departure_time_str, "%Y-%m-%dT%H:%M").strftime(
    "%Y-%m-%d %H:%M:%S"
    )
    arrival_time = datetime.strptime(arrival_time_str, "%Y-%m-%dT%H:%M").strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    date = datetime.strptime(date_str, "%Y-%m-%d").strftime(
    "%Y-%m-%d"
    )

    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for("admin"))

    airplane_type = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "airplane.type",
        "search_read",
        [[("name", "=", airplane_type_name)]],
        {"fields": ["id", "seat_count"], "limit": 1},
    )

    if not airplane_type:
        flash("Geçersiz uçak tipi.")
        return redirect(url_for("admin"))

    airplane_type_id = airplane_type[0]["id"]

    flight_id = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "flight.management",
        "create",
        [
            {
                "flight_number": flight_code,
                "available_seats": airplane_type[0]["seat_count"],
                "departure_airport": int(departure_id),
                "arrival_airport": int(arrival_id),
                "departure_time": departure_time,
                "arrival_time": arrival_time,
                "user_price": user_price,
                "agency_price": agency_price,
                "flight_direction": flight_direction,
                "airplane_type_id": airplane_type_id,
                "svc_type": svc_type,
                "date": date,
                "aircraft_category": aircraft_category,
                "airline_company": airline_company,
                "chain_number": chain_number,
                "user_id": False,
            }
        ],
    )

    if flight_id:
        flash("Flight added successfully.")
    else:
        flash("An error occurred while adding the flight.")

    return redirect(url_for("admin"))


@app.route("/search-flight-ticket", methods=["POST"])
def search_ticket():
    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for("index"))
    
    search_criteria = request.form if request.method == "POST" else None

    departure_date = search_criteria.get('departure_time')
    return_date = search_criteria.get('return_time')
    
    selected_dates = []
    if departure_date:
        selected_dates.append(departure_date)
    if return_date:
        selected_dates.append(return_date)
    
    # Seçilen tarihleri session'a kaydediyoruz
    session['selected_dates'] = selected_dates
    
    return redirect(url_for("flight_ticket"))
    
@app.route("/flight-ticket", methods=["GET"])
def flight_ticket():
    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for("index"))

    selected_dates = session.get('selected_dates', [])
    domain = []

    if selected_dates:
        date_domains = []
        for selected_date in selected_dates:
            next_day = (datetime.strptime(selected_date, '%Y-%m-%d') + timedelta(days=1)).strftime('%Y-%m-%d')
            date_domain = [
                '&',
                ("departure_time", ">=", selected_date),
                ("departure_time", "<", next_day),
            ]
            date_domains.append(date_domain)
        domain = date_domains[0]
        for date_domain in date_domains[1:]:
            domain = ['|'] + domain + date_domain
    else:
        today = datetime.today().strftime('%Y-%m-%d')
        domain = [("departure_time", ">=", today)]

    # Odoo'dan uçuşları çekme işlemi
    flights = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "flight.management",
        "search_read",
        [domain],
        {
            "fields": [
                "id",
                "departure_time",
                "arrival_time",
                "flight_number",
                "flight_direction",
                "departure_airport",
                "arrival_airport",
                "available_seats",
                "user_price",
                "agency_price",
            ]
        },
    )

    # Uçuşları tarihe göre gruplama ve sayma işlemleri
    date_flight_map = {}
    outbound_count = {}
    return_count = {}

    for flight in flights:
        flight_date = flight["departure_time"].split(" ")[0]
        if flight_date not in date_flight_map:
            date_flight_map[flight_date] = []
            outbound_count[flight_date] = 0
            return_count[flight_date] = 0

        date_flight_map[flight_date].append(flight)

        if flight["flight_direction"] == "outbound":
            outbound_count[flight_date] += 1
        elif flight["flight_direction"] == "return":
            return_count[flight_date] += 1

    dates_to_render = selected_dates if selected_dates else list(date_flight_map.keys())
    
    session.pop('selected_dates', None)

    return render_template(
        "flight-ticket.html",
        dates=dates_to_render,
        flights=flights,
        outbound_count=outbound_count,
        return_count=return_count,
        logged_in_user=session.get("username"),
        logged_in_user_role=session.get("role"),
        current_page="flight-ticket",
    )

@app.route('/plane_layout/<int:flight_id>')
def plane_layout(flight_id):
    uid, models = odoo_connect()
    if not uid:
        return redirect(url_for('login'))

    # Kullanıcının rolünü alıyoruz
    user_role = session.get('role')

    # Uçağın koltuklarını alıyoruz
    seats = models.execute_kw(
        current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'],
        'flight.seat', 'search_read',
        [[('flight_id', '=', flight_id)]],
        {'fields': ['id', 'name', 'is_occupied', 'user_id']}
    )

    # Mevcut (seçilebilir) koltukların ID'lerini alıyoruz
    available_seats = [seat['id'] for seat in seats if not seat['is_occupied']]

    if user_role == 'admin':
        for seat in seats:
            if seat['is_occupied'] and seat['user_id']:
                user = models.execute_kw(
                    current_app.config['ODOO_DB'], uid, current_app.config['ODOO_PASSWORD'],
                    'custom.user', 'read',
                    [seat['user_id'][0]],
                    {'fields': ['username' ,'role']}
                )
                if user:
                    seat['occupant_name'] = user[0]['username']
                    
                    if user[0]['role'] == 'user':
                        seat['occupant_role'] = 'Müşteri'
                    elif user[0]['role'] == 'agency':
                        seat['occupant_role']  = 'Acenta'             
                else:
                    seat['occupant_name'] = 'Bilinmeyen'
            else:
                seat['occupant_name'] = None
    else:
        for seat in seats:
            seat['occupant_name'] = None

    return render_template('plane_rev.html', seats=seats, available_seats=available_seats, user_role=user_role)


@app.route("/flight_admin", methods=["GET"])
def flight_admin():
    uid, models = odoo_connect()
    if not uid:
        return jsonify({"error": "Odoo bağlantısı sağlanamadı."}), 500

    flights = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "flight.management",
        "search_read",
        [[]],
        {
            "fields": [
                "flight_direction",
                "flight_number",
                "svc_type",
                "departure_airport",
                "arrival_airport",
                "departure_time",
                "arrival_time",
            ]
        },
    )

    return jsonify(flights)

@app.route("/search_flights", methods=["GET"])
def search_flights():
    uid, models = odoo_connect()

    from_airport = request.args.get("departure_airport")
    to_airport = request.args.get("arrival_airport")
    departure_date = request.args.get("date")
    return_date = request.args.get("return_date")
    flight_direction = request.args.get("flight_direction")

    domain = []
    if from_airport:
        domain.append(("departure_airport", "=", from_airport))
    if to_airport:
        domain.append(("arrival_airport", "=", to_airport))
    if departure_date:
        domain.append(("date", ">=", departure_date))
        domain.append(("date", "<=", departure_date))
    if return_date:
        domain.append(("date", ">=", return_date))
        domain.append(("date", "<=", return_date))
    if flight_direction:
        domain.append(("flight_direction", "=", flight_direction))

    flights = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "flight.management",
        "search_read",
        [domain],
        {
            "fields": [
                "flight_direction",
                "departure_airport",
                "arrival_airport",
                "date",
            ]
        },
    )

    return jsonify(flights=flights)

@app.route("/assign_seats", methods=["POST"])
def assign_seats():
    if not session.get("username"):
        return jsonify({"success": False, "message": "Lütfen giriş yapınız."}), 401

    uid, models = odoo_connect()
    if not uid:
        return jsonify({"success": False, "message": "Odoo bağlantısı sağlanamadı."}), 500

    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Geçersiz veri."}), 400

    flight_id = data.get("flightId")
    seat_ids = data.get("seats")

    # Kullanıcı ID'sini oturumdan alıyoruz
    user_id = session.get("user_id")

    # Gerekli verileri kontrol ediyoruz
    if not flight_id or not seat_ids:
        return jsonify({"success": False, "message": "Eksik veri."}), 400

    # Koltukların geçerli olup olmadığını kontrol ediyoruz
    seats = models.execute_kw(
        current_app.config["ODOO_DB"],
        uid,
        current_app.config["ODOO_PASSWORD"],
        "flight.seat",
        "search_read",
        [[("id", "in", seat_ids), ("flight_id", "=", flight_id)]],
        {"fields": ["id", "user_id", "is_occupied"]},
    )

    # Seçilen koltuklardan herhangi biri rezerve edilmiş mi kontrol ediyoruz
    for seat in seats:
        if seat["user_id"] or seat["is_occupied"]:
            return jsonify({"success": False, "message": f"Koltuk {seat['id']} zaten rezerve edilmiş."}), 400

    try:
        # Koltukları kullanıcıya atıyoruz
        for seat_id in seat_ids:
            models.execute_kw(
                current_app.config["ODOO_DB"],
                uid,
                current_app.config["ODOO_PASSWORD"],
                "flight.seat",
                "write",
                [[seat_id], {"user_id": user_id, "is_occupied": True}]
            )

        return jsonify({"success": True, "message": "Koltuklar başarıyla atandı."})

    except Exception as e:
        return jsonify({"success": False, "message": f"Hata oluştu: {str(e)}"}), 500



@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))


@app.route("/support")
def support():
    return render_template("support.html")


@app.route("/offer")
def offer():
    return render_template("offer.html")


@app.route("/travel")
def travel():
    return render_template("travel.html")


@app.route("/agency")
@role_required(["agency"])
def agency_panel():
    return render_template("agency_panel.html")


@app.route("/sign")
def sign():
    return render_template("sign.html")
