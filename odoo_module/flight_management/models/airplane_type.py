from odoo import models, fields

class AirplaneType(models.Model):
    _name = 'airplane.type'
    _description = 'Airplane Type'

    name = fields.Char(string="Airplane Code", required=True)
    seat_count = fields.Integer(string="Seat Count", required=True)
