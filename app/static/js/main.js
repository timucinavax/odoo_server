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
    const fromSelect = document.getElementById('departure_airport');
    const toSelect = document.getElementById('arrival_airport');
    const departureDateInput = document.getElementById('departure_time');
    const arrivalDateInput = document.getElementById('arrival_time');

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

function setupDateInput(inputElement, availableDates) {
    inputElement.addEventListener('input', function () {
        const selectedDate = inputElement.value;
        if (!availableDates.includes(selectedDate)) {
            inputElement.value = '';  
            alert('Bu tarih seçilemez. Lütfen geçerli bir tarih seçin.');
        }
    });
}