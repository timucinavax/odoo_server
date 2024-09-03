document.addEventListener('DOMContentLoaded', function() {
    showSection('all-flights');

    const currentDate = new Date().setHours(0, 0, 0, 0);
    const activeFlightsBody = document.getElementById('active-flights-body');

    fetch('/search_flights')
        .then(response => response.json())
        .then(flights => {
            flights.forEach(flight => {
                const flightDate = new Date(flight.date).setHours(0, 0, 0, 0);

                if (flightDate >= currentDate) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${flight.flight_number}</td>
                        <td>${flight.svc_type}</td>
                        <td>${flight.departure_airport}</td>
                        <td>${flight.arrival_airport}</td>
                        <td>${flight.departure_time}</td>
                        <td>${flight.arrival_time}</td>
                    `;
                    activeFlightsBody.appendChild(row);
                }
            });
        })
        .catch(error => {
            console.error('Uçuş verileri alınırken bir hata oluştu:', error);
        });
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
