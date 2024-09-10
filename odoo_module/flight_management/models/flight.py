from odoo import models, fields, api

class Flight(models.Model):
    _name = 'flight.management'
    _description = 'Uçuş Yönetimi'
    
    flight_direction = fields.Selection([
        ('outbound', 'Gidiş'),
        ('return', 'Dönüş')
    ], string="Uçuş Yönü", required=True)

    flight_number = fields.Char(string="Uçuş Numarası", required=True)
    departure_airport = fields.Many2one('airport', string="Kalkış Havalimanı", required=True)
    arrival_airport = fields.Many2one('airport', string="Varış Havalimanı", required=True)
    departure_time = fields.Datetime(string="Kalkış Tarihi ve Saati", required=True)
    arrival_time = fields.Datetime(string="Varış Tarihi ve Saati", required=True)
    flight_duration = fields.Char(string="Uçuş Süresi", compute='_compute_flight_duration')
    available_seats = fields.Integer(string="Mevcut Koltuklar", required=True)
    date = fields.Date(string="Kalkış Tarihi", required=True)
    user_price = fields.Float(string="Müşteri Fiyatı", required=True)
    agency_price = fields.Float(string="Acenta Fiyatı", required=True)
    user_id = fields.Many2one('custom.user', string="Atanan Kullanıcı", readonly=True)
    svc_type = fields.Selection([
        ('FRY', 'FRY'),
        ('LIVE', 'LIVE')
    ], string="Hizmet Türü", required=True)
    airplane_type_id = fields.Many2one('airplane.type', string="Uçak Tipi", required=True)
    seat_ids = fields.One2many('flight.seat', 'flight_id', string="Koltuklar")
    aircraft_category = fields.Selection([
        ('Tarifeli', 'Tarifeli'),
        ('Zincir', 'Zincir'),
        ('İlaveli Sefer', 'İlaveli Sefer')
    ], string="Uçak Kategorisi", required=True)
    airline_company = fields.Selection([
        ('Turkish Airlines', 'Türk Hava Yolları'),
        ('Pegasus', 'Pegasus'),
        ('Saudia', 'Saudia')
    ], string="Havayolu Şirketi", required=True)
    chain_number = fields.Selection(
        [(str(num), f'Zincir {num}') for num in range(1, 51)],
        string="Zincir Numarası"
    )

    @api.depends('departure_time', 'arrival_time')
    def _compute_flight_duration(self):
        for record in self:
            if record.departure_time and record.arrival_time:
                duration = record.arrival_time - record.departure_time
                record.flight_duration = str(duration)
            else:
                record.flight_duration = "Belirtilmemiş"
    
    @api.model
    def create(self, vals):
        flight = super(Flight, self).create(vals)
        if flight.airplane_type_id:
            seat_data = []
            for seat_num in range(1, flight.airplane_type_id.seat_count + 1):
                seat_data.append({
                    'name': f'Koltuk {seat_num}',
                    'flight_id': flight.id,
                })
            self.env['flight.seat'].create(seat_data)
        return flight
