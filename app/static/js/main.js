document.addEventListener("DOMContentLoaded", function () {
    createCookieConsent();
    loadCities();
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

function loadCities() {
    fetch("{{ url_for('static', filename='js/cities.json') }}")
        .then((response) => response.json())
        .then((data) => {
            const turkeyContainer = document.querySelector("#turkey .row");
            const africaContainer = document.querySelector("#africa .row");

            data.turkey.forEach((city) => {
                const cityElement = document.createElement("div");
                cityElement.classList.add("col-md-3");
                cityElement.innerHTML = `<i class="bi bi-geo-alt-fill"></i> ${city}`;
                turkeyContainer.appendChild(cityElement);
            });

            data.africa.forEach((city) => {
                const cityElement = document.createElement("div");
                cityElement.classList.add("col-md-3");
                cityElement.innerHTML = `<i class="bi bi-geo-alt-fill"></i> ${city}`;
                africaContainer.appendChild(cityElement);
            });
        });
}

function handleSearchForm() {
    const oneWayTab = document.getElementById('one-way-tab');
    const roundTripTab = document.getElementById('round-trip-tab');
    const returnDateGroup = document.getElementById('return-date-group');
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    const departureSelect = document.getElementById('departure-date');
    const arrivalSelect = document.getElementById('return-date');

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
            const departureAirports = [...new Set(data.flights.map(flight => flight.departure_airport))];
            const arrivalAirports = [...new Set(data.flights.map(flight => flight.arrival_airport))];
            const departureDate = [...new Set(data.flights.map(flight => flight.departure_time.split(' ')[0]))];
            const arrivalDate = [...new Set(data.flights.map(flight => flight.arrival_time.split(' ')[0]))]

            populateSelectOptions(fromSelect, departureAirports);
            populateSelectOptions(toSelect, arrivalAirports);
            populateDateOptions(departureSelect, departureDate);
            populateDateOptions(arrivalSelect , arrivalDate)
        })
        .catch(error => {
            console.error('Error fetching flights:', error);
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

function populateDateOptions(dateInput, availableDates) {
    availableDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateInput.appendChild(option);
    });
}
