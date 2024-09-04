document.addEventListener("DOMContentLoaded", function () {
    createCookieConsent();
    handleSearchForm();
    postFlightSearch();
    searchBox();
});

function postFlightSearch() {
    const form = document.querySelector('.search-form');
    const searchButton = document.querySelector('.search-button');

    searchButton.addEventListener('click', function (e) {
        e.preventDefault(); 

        const formData = new FormData(form);
        const formDataObject = {};
        formData.forEach((value, key) => formDataObject[key] = value);

        fetch('/flight-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = '/flight-ticket';
            } else {
                return response.json(); 
            }
        })
        .then(data => {
            console.log('Success:', data); 
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}

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
    const departureAirportSelect = document.getElementById("departure_airport");
    const arrivalAirportSelect = document.getElementById("arrival_airport");
    const departureDateSelect = document.getElementById("departure_date");
    const returnDateSelect = document.getElementById("return_date");
    const tripTypeSelect = document.getElementById("trip_type");

    departureAirportSelect.addEventListener("change", function () {
        const departureAirport = this.value;

        if (departureAirport) {
            fetch(`/search_flights?departure_airport=${departureAirport}`)
                .then((response) => response.json())
                .then((data) => {
                    arrivalAirportSelect.innerHTML = ""; // Önceki seçenekleri temizle
                    const uniqueAirports = [...new Set(data.flights.map(flight => flight.arrival_airport))];
                    uniqueAirports.forEach((airport) => {
                        const option = document.createElement("option");
                        option.value = airport;
                        option.textContent = airport;
                        arrivalAirportSelect.appendChild(option);
                    });
                    arrivalAirportSelect.disabled = false;
                });
        }
    });

    arrivalAirportSelect.addEventListener("change", function () {
        const departureAirport = departureAirportSelect.value;
        const arrivalAirport = this.value;

        if (departureAirport && arrivalAirport) {
            fetch(`/search_flights?departure_airport=${departureAirport}&arrival_airport=${arrivalAirport}`)
                .then((response) => response.json())
                .then((data) => {
                    departureDateSelect.innerHTML = ""; 
                    const uniqueDates = [...new Set(data.flights.map(flight => flight.date))];
                    uniqueDates.forEach((date) => {
                        const option = document.createElement("option");
                        option.value = date;
                        option.textContent = date;
                        departureDateSelect.appendChild(option);
                    });
                    departureDateSelect.disabled = false;
                });
        }
    });

    tripTypeSelect.addEventListener("change", function () {
        if (this.value === "round_trip") {
            returnDateSelect.disabled = false;
            returnDateSelect.addEventListener("change", function () {
                const departureAirport = departureAirportSelect.value;
                const arrivalAirport = arrivalAirportSelect.value;
                const departureDate = departureDateSelect.value;

                if (departureAirport && arrivalAirport && departureDate) {
                    fetch(`/search_flights?departure_airport=${arrivalAirport}&arrival_airport=${departureAirport}&date=${departureDate}`)
                        .then((response) => response.json())
                        .then((data) => {
                            returnDateSelect.innerHTML = ""; 
                            const uniqueDates = [...new Set(data.flights.map(flight => flight.date))];
                            uniqueDates.forEach((date) => {
                                const option = document.createElement("option");
                                option.value = date;
                                option.textContent = date;
                                returnDateSelect.appendChild(option);
                            });
                            returnDateSelect.disabled = false;
                        });
                }
            });
        } else {
            returnDateSelect.disabled = true;
            returnDateSelect.innerHTML = ""; // Dönüş tarihi seçeneklerini temizle
        }
    });
}
