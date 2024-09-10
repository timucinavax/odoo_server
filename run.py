from app import app
from babel.dates import format_datetime
import logging
import locale
from datetime import datetime
import pytz

# Flask uygulaması için dosya önbellekleme ayarlarını kapatma
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Tarih ve saat formatını yerelleştirmek için gerekli ayarlar
locale.setlocale(locale.LC_TIME, 'tr_TR.UTF-8')
now = datetime.now(pytz.timezone('Europe/Istanbul'))
formatted_date = format_datetime(now, 'dd MMMM yyyy HH:mm', locale='tr_TR')
def datetime_local_format(value):
    if isinstance(value, str):
        value = datetime.strptime(value, '%Y-%m-%d %H:%M:%S') 
    return value.strftime('%Y-%m-%dT%H:%M')

# Log dosyasını yapılandırma
logging.basicConfig(filename='flask_app.log', level=logging.INFO)

# Uygulamayı başlatma
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8450)
