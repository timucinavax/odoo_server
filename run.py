from app import app
from babel.dates import format_datetime
from flask_babel import Babel, format_datetime
import logging
import locale
from datetime import datetime
import pytz

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

locale.setlocale(locale.LC_TIME, 'tr_TR.UTF-8')
now = datetime.now(pytz.timezone('Europe/Istanbul'))
formatted_date = format_datetime(now, 'dd MMMM yyyy HH:mm', locale='tr_TR')

logging.basicConfig(filename='flask_app.log', level=logging.INFO)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8450)
