document.addEventListener("DOMContentLoaded", function () {
    createCookieConsent();
    handleSearchForm();
    postFlightSearch();
    searchBox();
    initReferenceCarousel();
});

function initReferenceCarousel() {
    const carouselInner = document.querySelector('.reference-carousel-inner');
    const items = carouselInner.children;
    let currentIndex = 0;

    function slideCarousel() {
        currentIndex = (currentIndex + 1) % items.length;
        const offset = -currentIndex * 20;  
        carouselInner.style.transition = 'transform 0.5s ease';
        carouselInner.style.transform = `translateX(${offset}%)`;

        if (currentIndex === items.length - 1) {
            setTimeout(() => {
                carouselInner.style.transition = 'none';
                carouselInner.style.transform = `translateX(0%)`;
                currentIndex = 0;
            }, 500);
        }
    }

    setInterval(slideCarousel, 3000);
}

function postFlightSearch() {
    const form = document.querySelector('.search-form');
    const searchButton = document.querySelector('.search-button');

    searchButton.addEventListener('click', function (e) {
        e.preventDefault();

        const departureTime = document.getElementById('departure_time').value;
        const returnTime = document.getElementById('return_time').value;

        if (departureTime) {
            addHiddenInput(form, 'departure_time', departureTime);
        }

        if (returnTime) {
            addHiddenInput(form, 'return_time', returnTime);
        }
        form.action = "/search-flight-ticket";
        form.method = "POST";
        form.submit();
    });
}

// Gizli input ekleyen fonksiyon
function addHiddenInput(form, name, value) {
    const existingInput = form.querySelector(`input[name="${name}"]`);
    if (existingInput) {
        existingInput.value = value; // Eğer hidden input varsa, sadece değerini güncelleyin
    } else {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }
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
    const oneWayTab = document.getElementById('one-way-tab');
    const roundTripTab = document.getElementById('round-trip-tab');
    const returnSection = document.getElementById('return-section');
    const fromSelect = document.getElementById('departure_airport');
    const toSelect = document.getElementById('arrival_airport');
    const departureDateInput = document.getElementById('departure_time');
    const returnDepartureSelect = document.getElementById('return_departure_airport');
    const returnArrivalSelect = document.getElementById('return_arrival_airport');
    const returnDateInput = document.getElementById('return_time');

    oneWayTab.addEventListener('click', function () {
        oneWayTab.classList.add('active');
        roundTripTab.classList.remove('active');
        returnSection.style.display = 'none';
    });

    roundTripTab.addEventListener('click', function () {
        roundTripTab.classList.add('active');
        oneWayTab.classList.remove('active');
        returnSection.style.display = 'block';
    });

    let flightsData = [];

    fetch('/search_flights')
        .then(response => response.json())
        .then(data => {
            if (data.flights) {
                flightsData = data.flights;
                populateAllFlights();
            } else {
                console.error("Flights data is missing in the response");
            }
        })
        .catch(error => {
            console.error('Error fetching flights:', error);
        });

    function populateAllFlights() {
        const departureAirports = [...new Set(flightsData.map(flight => flight.departure_airport[1]))];
        populateSelectOptions(fromSelect, departureAirports);
    }

    fromSelect.addEventListener('change', function () {
        const selectedDeparture = fromSelect.value;
        const filteredFlights = flightsData.filter(flight => flight.departure_airport[1] === selectedDeparture);

        const arrivalAirports = [...new Set(filteredFlights.map(flight => flight.arrival_airport[1]))];
        populateSelectOptions(toSelect, arrivalAirports);

        toSelect.addEventListener('change', function () {
            const selectedArrival = toSelect.value;
            const matchingFlights = filteredFlights.filter(flight => flight.arrival_airport[1] === selectedArrival);

            const availableDepartureDates = [...new Set(matchingFlights.map(flight => flight.date.split(' ')[0]))];
            populateSelectOptions(departureDateInput, availableDepartureDates);

            if (roundTripTab.classList.contains('active')) {
                updateReturnOptions(selectedArrival, selectedDeparture); // Dönüş uçuşları için doğru yönü kontrol et
            }
        });
    });

    function updateReturnOptions(arrival, departure) {
        const returnFlights = flightsData.filter(flight =>
            flight.departure_airport[1] === arrival &&
            flight.arrival_airport[1] === departure
        );

        const returnDepartureAirports = [...new Set(returnFlights.map(flight => flight.departure_airport[1]))];
        const returnArrivalAirports = [...new Set(returnFlights.map(flight => flight.arrival_airport[1]))];

        populateSelectOptions(returnDepartureSelect, returnDepartureAirports);
        populateSelectOptions(returnArrivalSelect, returnArrivalAirports);

        returnArrivalSelect.addEventListener('change', function () {
            const selectedReturnArrival = returnArrivalSelect.value;
            const matchingReturnFlights = returnFlights.filter(flight => flight.arrival_airport[1] === selectedReturnArrival);

            const availableReturnDates = [...new Set(matchingReturnFlights.map(flight => flight.date.split(' ')[0]))];
            populateSelectOptions(returnDateInput, availableReturnDates);
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
