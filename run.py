from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="217.160.138.215", port=8450)

