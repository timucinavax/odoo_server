from odoo import models, fields, api

class Flight(models.Model):
    _name = 'flight.management'
    _description = 'Flight Management'
    
    flight_direction = fields.Selection([
        ('outbound', 'Outbound'),
        ('return', 'Return')
    ], string="Flight Direction", required=True)

    flight_number = fields.Char(string="Flight Number", required=True)
    departure_airport = fields.Many2one('airport',string="Departure Airport", required=True)
    arrival_airport = fields.Many2one('airport',string="Arrival Airport", required=True)
    departure_time = fields.Datetime(string="Departure Time", required=True)
    arrival_time = fields.Datetime(string="Arrival Time", required=True)
    flight_duration = fields.Char(string="Flight Duration", compute='_compute_flight_duration')
    available_seats = fields.Integer(string="Available Seats", required=True)
    date = fields.Date(string="Deaprture Time" , required=True)
    user_price = fields.Float(string="User Price", required=True)
    agency_price = fields.Float(string="Agency Price", required=True)
    user_id = fields.Many2one('custom.user', string="Assigned User", readonly=True)
    svc_type = fields.Selection([
	('FRY','FRY'),('LIVE','LIVE')], required=True)    
    airplane_type_id = fields.Many2one('airplane.type', string="Airplane Type", required=True)
    seat_ids = fields.One2many('flight.seat', 'flight_id', string="Seats")
    
    @api.depends('departure_time', 'arrival_time')
    def _compute_flight_duration(self):
        for record in self:
            if record.departure_time and record.arrival_time:
                duration = record.arrival_time - record.departure_time
                record.flight_duration = str(duration)
            else:
                record.flight_duration = "N/A"
    
    @api.model
    def create(self, vals):
        flight = super(Flight, self).create(vals)
        if flight.airplane_type_id:
            seat_data = []
            for seat_num in range(1, flight.airplane_type_id.seat_count + 1):
                seat_data.append({
                    'name': f'Seat {seat_num}',
                    'flight_id': flight.id,
                })
            self.env['flight.seat'].create(seat_data)
        return flight
