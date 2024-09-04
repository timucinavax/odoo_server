from odoo import models, fields

class CustomUser(models.Model):
    _name = 'custom.user'
    _description = 'Custom User'

    email = fields.Char(string='Email', required=True)
    username = fields.Char(string='Username', required=True)
    password = fields.Char(string='Password', required=True)
    role = fields.Selection([('user', 'User'), ('admin', 'Admin'), ('agency', 'Agency')], string='Role', required=True)
