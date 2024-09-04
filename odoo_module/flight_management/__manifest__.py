{
    'name': 'Flight Management',
    'version': '1.0',
    'category': 'Travel',
    'summary': 'Manage flights and seat reservations',
    'description': """
        Module to manage flights, seat reservations, and airplane types.
    """,
    'author': 'Your Name',
    'depends': ['base','custom_user_module'],
    'data': [
    'security/ir.model.access.csv',
    'views/flight_views.xml',
    'views/airplane_type_views.xml',
    'views/seat_views.xml',
    'views/airport_data.xml',
    'data/airplane_type_data.xml',
     ],
    'installable': True,
    'application': True,
}
