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

    // İlk olarak, kalkış havaalanı seçildikten sonra ilgili varış havaalanlarını göster
    fromSelect.addEventListener('change', function () {
        const selectedDeparture = fromSelect.value;
        fetch(`/get_arrival_airports?departure_airport=${selectedDeparture}`)
            .then(response => response.json())
            .then(data => {
                if (data.arrival_airports) {
                    populateSelectOptions(toSelect, data.arrival_airports);
                    toSelect.disabled = false;
                } else {
                    console.error("Arrival airports data is missing");
                }
            })
            .catch(error => {
                console.error('Error fetching arrival airports:', error);
            });
    });

    // Varış havaalanı seçildikten sonra tarihleri filtrele
    toSelect.addEventListener('change', function () {
        const selectedDeparture = fromSelect.value;
        const selectedArrival = toSelect.value;
        fetch(`/get_available_dates?departure_airport=${selectedDeparture}&arrival_airport=${selectedArrival}`)
            .then(response => response.json())
            .then(data => {
                if (data.available_dates) {
                    setupDateInput(departureSelect, data.available_dates.departure);
                    setupDateInput(arrivalSelect, data.available_dates.arrival);
                    departureSelect.disabled = false;
                    arrivalSelect.disabled = false;
                } else {
                    console.error("Available dates data is missing");
                }
            })
            .catch(error => {
                console.error('Error fetching available dates:', error);
            });
    });
}

function setupDateInput(inputElement, availableDates) {
    inputElement.addEventListener('input', function () {
        const selectedDate = inputElement.value;
        if (!availableDates.includes(selectedDate)) {
            inputElement.value = '';  // Seçimi temizle
            alert('Bu tarih seçilemez. Lütfen geçerli bir tarih seçin.');
        }
    });
}

function populateSelectOptions(selectElement, options) {
    selectElement.innerHTML = '<option value="">Seçin...</option>';  // Mevcut seçenekleri temizle
    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        selectElement.appendChild(option);
    });
    selectElement.disabled = false;  // Seçimi aktif hale getir
}
