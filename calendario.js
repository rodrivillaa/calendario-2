// formulario.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eventForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;

        if (eventName === "" || eventDate === "") {
            alert("Por favor completa todos los campos.");
            return;
        }


           // Obtener datos meteorológicos antes de guardar el evento
           const weather = await getWeather(eventDate);



        const newEvent = {
            id: (Math.random() * 100).toString(36).slice(3),
            name: eventName,
            date: eventDate,
            time: eventTime || "00:00",
            color: document.querySelector("#eventColor").value, // Obtener color elegido
            weather: weather // Guardar datos del clima en el evento
            
        };

        // Guardar el evento en localStorage
        let events = JSON.parse(localStorage.getItem('items')) || [];
        events.unshift(newEvent);
        localStorage.setItem('items', JSON.stringify(events));

        
        window.location.href = 'index.html'; // Redirigir a la página principal después de agregar el evento
    });
});


async function getWeather(eventDate) {
    const apiKey = 'cc0ba138407c9030fbf2cbeddc9a2f5d'; // Reemplaza con tu clave API
    const city = 'Buenos Aires'; // Reemplaza con tu ciudad
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Encuentra el pronóstico más cercano a la fecha del evento
        const forecast = data.list.find(item => {
            const forecastDate = new Date(item.dt_txt);
             // Ajusta la fecha a la zona horaria de Argentina
             forecastDate.setHours(forecastDate.getHours() - 3);
             return forecastDate.toDateString() === new Date(eventDate).toDateString();
            
        });

        if (forecast) {
            return {
                temp: forecast.main.temp,
                description: forecast.weather[0].description,
                icon: forecast.weather[0].icon
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Función para obtener el clima (copia de la función existente en tu script principal)
