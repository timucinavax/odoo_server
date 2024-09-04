{
    'name': 'Custom User Module',
    'version': '1.0',
    'summary': 'Custom user management for Sehlen Turizm',
    'description': 'A custom user management system independent from Odoo\'s default user model.',
    'category': 'Tools',
    'author': 'Emre',
    'website': 'https://www.macnef.com',
    'depends': ['base'],
    'data': [
        'views/custom_user_views.xml',
        'security/ir.model.access.csv',
    ],
    'installable': True,
    'application': True,
}
