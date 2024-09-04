document.addEventListener('DOMContentLoaded', function() {
    showSection('all-flights');
    activateFlights();
});

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');
    const sectionToShow = document.getElementById(sectionId);
    sectionToShow.style.display = 'block';

    const navItems = document.querySelectorAll('.navbar-nav .nav-link');
    navItems.forEach(item => item.classList.remove('active'));

    const activeNavItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    window.scrollTo({
        top: sectionToShow.offsetTop - document.querySelector('.navbar').offsetHeight,
        behavior: 'smooth'
    });
}

function activateFlights() {
    const currentDate = new Date();

    fetch('/flight_admin')
        .then(response => response.json())
        .then(flights => {
            console.log(flights);
            if (!flights || flights.length === 0) {
                console.error('Uçuş verisi alınamadı veya boş geldi.');
                return;
            }

            const activeOutboundFlightsBody = document.getElementById('active-outbound-flights-body');
            const activeReturnFlightsBody = document.getElementById('active-return-flights-body');
            activeOutboundFlightsBody.innerHTML = ''; 
            activeReturnFlightsBody.innerHTML = ''; 

            flights.forEach(flight => {
                const flightDate = new Date(flight.departure_time);

                if (flightDate >= currentDate) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>🟢</td>
                        <td>${flight.flight_number}</td>
                        <td>${flight.svc_type}</td>
                        <td>${flight.departure_airport && flight.departure_airport[1] ? flight.departure_airport[1] : 'Bilinmiyor'}</td>
                        <td>${flight.arrival_airport && flight.arrival_airport[1] ? flight.arrival_airport[1] : 'Bilinmiyor'}</td>
                        <td>${flight.departure_time}</td>
                        <td>${flight.arrival_time}</td>
                    `;

                    if (flight.flight_direction === 'outbound') {
                        activeOutboundFlightsBody.appendChild(row);
                    } else if (flight.flight_direction === 'return') {
                        activeReturnFlightsBody.appendChild(row);
                    }
                }
            });
        })
        .catch(error => {
            console.error('Uçuş verileri alınırken bir hata oluştu:', error);
        });
}
