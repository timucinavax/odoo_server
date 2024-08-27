document.addEventListener("DOMContentLoaded", function () {

    createCookieConsent();
    handleSearchForm();

});


function createCookieConsent() {
    const cookieConsent = document.createElement("div");
    cookieConsent.className = "cookie-consent";
    cookieConsent.innerHTML = `
        <p>Sitemizde yasal düzenlemelere uygun çerezler (cookies) kullanıyoruz. Detaylı bilgiye 
        <a href="https://www.sehlentur.com/gizlilik-politikasi-ve-cerez-aydinlatma-metni/">Gizlilik Politikası Ve Çerez Aydınlatma Metni</a> sayfamızdan ulaşabilirsiniz.</p>
        <div class="cookie-buttons">
            <a href="#" class="btn btn-consent">Tamam</a>
            <a href="https://www.sehlentur.com/gizlilik-politikasi-ve-cerez-aydinlatma-metni/" class="btn">Gizlilik Politikası Ve Çerez Aydınlatma Metni</a>
            <a href="https://www.sehlentur.com/kisisel-verilerin-korunmasi-kanunu/" class="btn">Kişisel Verilerin Korunması Kanunu Aydınlatma Metni</a>
        </div>
    `;
    document.body.appendChild(cookieConsent);

    document.querySelector(".btn-consent").addEventListener("click", function (e) {
        e.preventDefault();
        cookieConsent.style.display = "none";
    });
}

function handleSearchForm() {
    const oneWayTab = document.getElementById('one-way-tab');
    const roundTripTab = document.getElementById('round-trip-tab');
    const returnDateGroup = document.getElementById('return-date-group');
    const fromSelect = document.getElementById('departure_airport');
    const toSelect = document.getElementById('arrival_airport');
    const departureDateInput = document.getElementById('departure_time');
    const arrivalDateInput = document.getElementById('arrival_time');

    oneWayTab.addEventListener('click', function () {
        oneWayTab.classList.add('active');
        roundTripTab.classList.remove('active');
        returnDateGroup.style.display = 'none';
    });

    roundTripTab.addEventListener('click', function () {
        roundTripTab.classList.add('active');
        oneWayTab.classList.remove('active');
        returnDateGroup.style.display = 'block';
    });

    returnDateGroup.style.display = 'none';

    fetch('/search_flights')
        .then(response => response.json())
        .then(data => {
            if (data.flights) {
                populateSelectOptions(fromSelect, [...new Set(data.flights.map(flight => flight.departure_airport))]);

                fromSelect.addEventListener('change', function () {
                    const selectedFrom = fromSelect.value;
                    const filteredFlights = data.flights.filter(flight => flight.departure_airport === selectedFrom);
                    populateSelectOptions(toSelect, [...new Set(filteredFlights.map(flight => flight.arrival_airport))]);

                    toSelect.disabled = false;
                    departureDateInput.disabled = true;
                    arrivalDateInput.disabled = true;

                    toSelect.addEventListener('change', function () {
                        const selectedTo = toSelect.value;
                        const matchedFlights = filteredFlights.filter(flight => flight.arrival_airport === selectedTo);
                        const availableDates = [...new Set(matchedFlights.map(flight => flight.departure_time.split(' ')[0]))];

                        setupDateInput(departureDateInput, availableDates);
                        departureDateInput.disabled = false;
                        arrivalDateInput.disabled = false;
                    });
                });
            } else {
                console.error("Flights data is missing in the response");
            }
        })
        .catch(error => {
            console.error('Error fetching flights:', error);
        });

    function setupDateInput(inputElement, availableDates) {
        const dateList = availableDates.map(date => new Date(date).getTime()); // Tarihleri milisaniye olarak al

        document.getElementById('calendar-button').addEventListener('click', function () {
            inputElement.focus();  // Takvimi tetiklemek için input alanını odaklayın

            const calendar = document.createElement('div');
            calendar.className = 'custom-calendar';

            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            let calendarHTML = '<table class="table table-bordered"><thead><tr>';
            const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
            daysOfWeek.forEach(day => {
                calendarHTML += `<th>${day}</th>`;
            });
            calendarHTML += '</tr></thead><tbody><tr>';

            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(year, month, i);
                const isAvailable = dateList.includes(date.getTime());

                calendarHTML += `<td>
                        <button class="btn ${isAvailable ? 'btn-primary' : 'btn-secondary'}" 
                            ${isAvailable ? '' : 'disabled'}>
                            ${i}
                        </button>
                    </td>`;

                if (date.getDay() === 6) {
                    calendarHTML += '</tr><tr>';
                }
            }
            calendarHTML += '</tr></tbody></table>';

            calendar.innerHTML = calendarHTML;
            document.body.appendChild(calendar);

            calendar.addEventListener('click', function (e) {
                const clickedDate = e.target.textContent;
                if (dateList.includes(new Date(year, month, clickedDate).getTime())) {
                    inputElement.value = `${year}-${String(month + 1).padStart(2, '0')}-${String(clickedDate).padStart(2, '0')}`;
                    document.body.removeChild(calendar);
                }
            });
        });
    }
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

