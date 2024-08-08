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



        const newEvent = {
            id: (Math.random() * 100).toString(36).slice(3),
            name: eventName,
            date: eventDate,
            time: eventTime || "00:00",
            color: document.querySelector("#eventColor").value, // Obtener color elegido
            
        };

        // Guardar el evento en localStorage
        let events = JSON.parse(localStorage.getItem('items')) || [];
        events.unshift(newEvent);
        localStorage.setItem('items', JSON.stringify(events));

        
        window.location.href = 'index.html'; // Redirigir a la página principal después de agregar el evento
    });
});

// Función para obtener el clima (copia de la función existente en tu script principal)
