document.addEventListener("DOMContentLoaded", function () {
  var cookieConsent = document.createElement("div");
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
});

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

document.addEventListener('DOMContentLoaded', function() {
    const oneWayTab = document.getElementById('one-way-tab');
    const roundTripTab = document.getElementById('round-trip-tab');
    const returnDateGroup = document.getElementById('return-date-group');
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');

    oneWayTab.addEventListener('click', function() {
        oneWayTab.classList.add('active');
        roundTripTab.classList.remove('active');
        returnDateGroup.style.display = 'none';
    });

    roundTripTab.addEventListener('click', function() {
        roundTripTab.classList.add('active');
        oneWayTab.classList.remove('active');
        returnDateGroup.style.display = 'block';
    });

    returnDateGroup.style.display = 'none';

    fetch('/search_flights')
        .then(response => response.json())
        .then(data => {
            const departureAirports = [...new Set(data.map(flight => flight.departure_airport))];
            const arrivalAirports = [...new Set(data.map(flight => flight.arrival_airport))];

            departureAirports.forEach(airport => {
                const option = document.createElement('option');
                option.value = airport;
                option.textContent = airport;
                fromSelect.appendChild(option);
            });

            arrivalAirports.forEach(airport => {
                const option = document.createElement('option');
                option.value = airport;
                option.textContent = airport;
                toSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching flights:', error);
        });
    });
