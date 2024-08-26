function handleSearchForm() {
    const fromSelect = document.getElementById('departure_airport');
    const toSelect = document.getElementById('arrival_airport');
    const departureCalendarIcon = document.getElementById('departure_calendar_icon');
    const arrivalCalendarIcon = document.getElementById('arrival_calendar_icon');
    const calendarContainer = document.getElementById('flight-calendar');
    const departureInput = document.getElementById('departure_time');
    const arrivalInput = document.getElementById('arrival_time');

    fetch('/search_flights')
        .then(response => response.json())
        .then(data => {
            if (data.flights) {
                populateSelectOptions(fromSelect, [...new Set(data.flights.map(flight => flight.departure_airport))]);
                
                fromSelect.addEventListener('change', function () {
                    const selectedFrom = fromSelect.value;
                    const filteredFlights = data.flights.filter(flight => flight.departure_airport === selectedFrom);
                    populateSelectOptions(toSelect, [...new Set(filteredFlights.map(flight => flight.arrival_airport))]);
                });

                toSelect.addEventListener('change', function () {
                    const selectedFrom = fromSelect.value;
                    const selectedTo = toSelect.value;
                    const filteredFlights = data.flights.filter(flight => flight.departure_airport === selectedFrom && flight.arrival_airport === selectedTo);
                    const availableDates = [...new Set(filteredFlights.map(flight => flight.departure_time.split(' ')[0]))];
                    renderCalendar(availableDates, calendarContainer, departureInput, arrivalInput);
                });

                departureCalendarIcon.addEventListener('click', function () {
                    calendarContainer.style.display = 'block';
                });

                arrivalCalendarIcon.addEventListener('click', function () {
                    calendarContainer.style.display = 'block';
                });
            } else {
                console.error("Flights data is missing in the response");
            }
        })
        .catch(error => {
            console.error('Error fetching flights:', error);
        });
}

function populateSelectOptions(selectElement, options) {
    selectElement.innerHTML = '<option value="">Seçiniz</option>';
    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        selectElement.appendChild(option);
    });
}

function renderCalendar(availableDates, container, departureInput, arrivalInput) {
    const today = new Date();
    let calendarHTML = '<table class="table table-bordered"><thead><tr>';
    
    // Haftanın günlerini ekle
    const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    daysOfWeek.forEach(day => {
        calendarHTML += `<th>${day}</th>`;
    });
    
    calendarHTML += '</tr></thead><tbody><tr>';
    
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDay = firstDay.getDay();
    
    for (let i = 0; i < startDay; i++) {
        calendarHTML += '<td></td>';
    }
    
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    for (let date = 1; date <= daysInMonth; date++) {
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        if (availableDates.includes(dateStr)) {
            calendarHTML += `<td><button class="btn btn-primary" onclick="selectDate('${dateStr}', '${departureInput.id}', '${arrivalInput.id}')">${date}</button></td>`;
        } else {
            calendarHTML += `<td><button class="btn btn-secondary" disabled>${date}</button></td>`;
        }
        
        if ((date + startDay) % 7 === 0) {
            calendarHTML += '</tr><tr>';
        }
    }
    
    calendarHTML += '</tr></tbody></table>';
    
    container.innerHTML = calendarHTML;
}

function selectDate(dateStr, departureInputId, arrivalInputId) {
    const departureInput = document.getElementById(departureInputId);
    const arrivalInput = document.getElementById(arrivalInputId);
    if (!departureInput.value) {
        departureInput.value = dateStr;
    } else {
        arrivalInput.value = dateStr;
    }
}