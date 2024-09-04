from odoo import models, fields

class FlightSeat(models.Model):
    _name = 'flight.seat'
    _description = 'Flight Seat'

    name = fields.Char(string="Seat", required=True)
    flight_id = fields.Many2one('flight.management', string="Flight", required=True)
    is_occupied = fields.Boolean(string="Occupied", default=False)
    user_id = fields.Many2one('custom.user', string="Assigned User", readonly=True)
