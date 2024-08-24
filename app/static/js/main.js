function goToLogin() {
    window.location.href = "{{ url_for('sign') }}";
  }

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

    document
      .querySelector(".btn-consent")
      .addEventListener("click", function (e) {
        e.preventDefault();
        cookieConsent.style.display = "none";
      });
  });

  var style = document.createElement("style");
  style.innerHTML = `
    .cookie-consent {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* Arka plan şeffaflığı */
        color: #fff;
        padding: 15px;
        text-align: center;
        z-index: 1000;
        box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.3);
    }
    .cookie-consent p {
        margin: 0;
        padding: 0;
        font-size: 14px;
    }
    .cookie-consent a {
        color: #ffc107;
        text-decoration: none;
        margin: 0 5px;
        font-weight: bold;
    }
    .cookie-buttons {
        margin-top: 10px;
    }
    .cookie-buttons .btn {
        display: inline-block;
        background-color: #fff; /* Buton rengi beyaz */
        color: #000;
        padding: 10px 20px;
        margin: 5px;
        border-radius: 5px;
        font-weight: bold;
        text-decoration: none;
        border: 1px solid #ccc;
        transition: background-color 0.3s ease, color 0.3s ease;
    }
    .cookie-buttons .btn-consent {
        background-color: #fff; /* Buton rengi beyaz */
        color: #000;
    }
    .cookie-buttons .btn:hover {
        background-color: #f1f1f1; /* Hover durumu */
        color: #000;
    }
    .cookie-buttons .btn-consent:hover {
        background-color: #f1f1f1; /* Hover durumu */
        color: #000;
    }
`;
  document.head.appendChild(style);

  fetch("{{ url_for('static', filename='js/cities.json') }}")
    .then((response) => response.json())
    .then((data) => {
      const turkeyContainer = document.querySelector("#turkey .row");
      const europeContainer = document.querySelector("#europe .row");
      const asiaContainer = document.querySelector("#asia .row");
      const africaContainer = document.querySelector("#africa .row");

      data.turkey.forEach((city) => {
        const cityElement = document.createElement("div");
        cityElement.classList.add("col-md-3");
        cityElement.innerHTML = `<i class="bi bi-geo-alt-fill"></i> ${city}`;
        turkeyContainer.appendChild(cityElement);
      });

      data.europe.forEach((city) => {
        const cityElement = document.createElement("div");
        cityElement.classList.add("col-md-3");
        cityElement.innerHTML = `<i class="bi bi-geo-alt-fill"></i> ${city}`;
        europeContainer.appendChild(cityElement);
      });

      data.asia.forEach((city) => {
        const cityElement = document.createElement("div");
        cityElement.classList.add("col-md-3");
        cityElement.innerHTML = `<i class="bi bi-geo-alt-fill"></i> ${city}`;
        asiaContainer.appendChild(cityElement);
      });

      data.africa.forEach((city) => {
        const cityElement = document.createElement("div");
        cityElement.classList.add("col-md-3");
        cityElement.innerHTML = `<i class="bi bi-geo-alt-fill"></i> ${city}`;
        africaContainer.appendChild(cityElement);
      });
    });