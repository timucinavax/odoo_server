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
    const departureSelect = document.getElementById('departure_time');
    const arrivalSelect = document.getElementById('arrival_time');

    let availableDepartureDates = [];
    let availableArrivalDates = [];

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
                const departureAirports = [...new Set(data.flights.map(flight => flight.departure_airport))];
                const arrivalAirports = [...new Set(data.flights.map(flight => flight.arrival_airport))];
                availableDepartureDates = [...new Set(data.flights.map(flight => flight.departure_time.split(' ')[0]))];
                availableArrivalDates = [...new Set(data.flights.map(flight => flight.arrival_time.split(' ')[0]))];

                populateSelectOptions(fromSelect, departureAirports);
                populateSelectOptions(toSelect, arrivalAirports);

                setupDateInput(departureSelect, availableDepartureDates);
                setupDateInput(arrivalSelect, availableArrivalDates);
            } else {
                console.error("Flights data is missing in the response");
            }
        })
        .catch(error => {
            console.error('Error fetching flights:', error);
        });
}

function setupDateInput(dateInput, availableDates) {
    flatpickr(dateInput, {
        dateFormat: "Y-m-d",
        enable: availableDates.map(date => new Date(date)), 
        locale: {
            firstDayOfWeek: 1 
        }
    });
}

function populateSelectOptions(selectElement, options) {
    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        selectElement.appendChild(option);
    });
}