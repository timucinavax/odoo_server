from odoo import models, fields

class Airport(models.Model):
    _name = 'airport'
    _description = 'Airport'

    name = fields.Char(string="Airport Name", required=True)
    code = fields.Char(string="Airport Code", required=True, size=3)
    city = fields.Char(string="City", required=True)
    country = fields.Char(string="Country", required=True)
