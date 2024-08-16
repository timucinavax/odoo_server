from flask import Flask, Blueprint, render_template, current_app
import xmlrpc.client

app = Flask(__name__)

# Flask Blueprint
main = Blueprint('main', __name__)

@main.route('/')
def index():
    # Odoo yapılandırma bilgilerini al
    url = current_app.config['ODOO_URL']
    db = current_app.config['ODOO_DB']
    username = current_app.config['ODOO_USERNAME']
    password = current_app.config['ODOO_PASSWORD']

    # Odoo'ya bağlan
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, password, {})

    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

    # Odoo'dan project.task modeline ait görevleri al
    tasks = models.execute_kw(db, uid, password,
                              'project.task', 'search_read',
                              [[]], 
                              {'fields': ['display_name', 'partner_id', 'color', 'task_count', 'closed_task_count',
                                          'open_task_count', 'milestone_count_reached', 'milestone_count',
                                          'allow_milestones', 'label_tasks', 'alias_email', 'is_favorite',
                                          'rating_count', 'rating_avg', 'rating_status', 'rating_active',
                                          'analytic_account_id', 'date', 'privacy_visibility', 'last_update_color',
                                          'last_update_status', 'tag_ids', 'sequence', 'user_id', 'activity_ids'], 'limit': 10})
    
    # HTML şablonuna görevleri geçir
    return render_template('index.html', tasks=tasks)

app.register_blueprint(main)

if __name__ == "__main__":
    app.run(debug=True)