from app import app

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

if __name__ == '__main__':
    app.run(host='0.0.0.0', port="8450")