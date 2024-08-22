from app import app
from babel.dates import format_datetime

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.jinja_env.filters['format_datetime'] = format_datetime

if __name__ == '__main__':
    app.run(debug=True ,host='0.0.0.0', port="8450")