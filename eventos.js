
if (Notification.permission === 'default') {
    Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
            console.log("Permiso de notificaciones concedido");
             // Suscribirse al push manager
             subscribeUserToPush();
            
        }
    });
}
//donde voy a guardar toda la informacion de mi9s eventos
function subscribeUserToPush() {
    console.log("Intentando suscribir al usuario...");
    navigator.serviceWorker.ready.then(function(registration) {
        console.log("Service Worker listo para suscripciones");
        // Aquí colocas tu clave pública VAPID del servidor
        const applicationServerKey = urlBase64ToUint8Array('BPNpkbBph-CQeyn5rOAWohgCitrTOQ1u68z_gmTgVMoQ5sHSVLHfHbhOTn4fvQYnMKr04GppK85bHkcye9VjWmE');
        
        registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        }).then(function(subscription) {
            console.log('Usuario suscrito:', subscription);

            // Envía la suscripción a tu servidor
            sendSubscriptionToServer(subscription);
        }).catch(function(error) {
            console.error('Error al suscribir al usuario:', error);
        });
    });
}
function sendSubscriptionToServer(subscription) {
    fetch('http://localhost:3000/subscription', { // La URL de tu servidor donde manejarás la suscripción
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Error al suscribir en el servidor.');
        }
        return response.json();
    }).then(data => {
        console.log('Suscripción almacenada en el servidor:', data);
    }).catch(error => {
        console.error('Error al enviar la suscripción al servidor:', error);
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

let events=[];
let arr=[];//caragar informacion

const eventName=document.querySelector("#eventName");
const eventDate=document.querySelector("#eventDate");
const eventTime=document.querySelector("#eventTime");
const buttonAdd =document.querySelector("#bAdd");
const eventContainer=document.querySelector("#eventsContainer");
const btn=document.querySelector("#btn")
const offscreen=document.querySelector(".oof-screen")
const bDelete=document.querySelector(".bDelete")








btn.addEventListener("click",()=>{
    offscreen.classList.toggle("active")

})

/* 
btnMenu.addEventListener("click", () => {
    menuScreen.classList.toggle("active");
});
addEventButton.addEventListener("click", () => {
    eventForm.classList.toggle("active");
    offscreen.classList.remove("active");
}); */

// Función para obtener el clima de un evento
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





//guardar en el localstorage
function loadEvents() {
const json=load();
try{
arr=JSON.parse(json)
}catch(error){
    arr=[];
}
events= arr?[...arr]:[];

// Renderizar eventos y establecer actualizaciones en tiempo real
renderEvents();
setInterval(updateEventTimes, 1000); }// Actualizar cada segundo



async function addEvent() {
    if(eventName.value === "" || eventDate.value === "") {
        return;
    }
     // Si la fecha que se pone ya pasó, que no pase nada
    const diff = dateDiff(eventDate.value, eventTime.value || '00:00');
    if (diff.totalMilliseconds < 0) {
    return;
    }


    // Obtener datos meteorológicos
    const weather = await getWeather(eventDate.value);

    const color = document.querySelector("#eventColor").value;
    console.log('Color del evento:', color); // Verifica el valor del color

    const newEvent = {
        id: (Math.random() * 100).toString(36).slice(3), // Genero un ID random
        name: eventName.value,
        date: eventDate.value,
        time:eventTime.value ||"00:00",
        color: color, // Obtener color elegido
        weather: weather,// Añadir datos meteorológicos al evento
        
    };

    // Agregar un elemento al inicio del array
    events.unshift(newEvent);

    save(JSON.stringify(events));

    eventName.value = "";
    console.log('Nuevo evento:', newEvent);
    renderEvents();
    updateCalendarEvents(); // Actualizar el calendario después de agregar un nuevo evento
}


/* function addEvent() {
    if(eventName.value===""||eventDate.value===""){
        return;

    }
    //si la fecha que se pone ya paso que no pase nada
    if (dateDiff(eventDate.value)<0) {
        return;
        
    }

    const newEvent={
        id:(Math.random()*100).toString(36).slice(3),//genero un id random
        name:eventName.value,
        date:eventDate.value,

    }
    
    //agrear un elemento al inicio del array
    events.unshift(newEvent);

    save(JSON.stringify(events));

    eventName.value="";

    renderEvents();
    updateCalendarEvents(); // Actualizar el calendario después de agregar un nuevo evento
    
} */

//ME VA A GENERAR EL NUMERO DE DIAS QUE FALTAN
function dateDiff(d, t) {
    const targetDate = new Date(`${d}T${t}:00`); // Fecha destino
    const today = new Date(); // Fecha actual
     // Asegúrate de que hoy esté en la misma zona horaria para la comparación
 // Mostrar las fechas en la consola para verificar
console.log("Fecha objetivo:", targetDate.toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }));
console.log("Fecha actual:", today.toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }));

 // Ajustar ambas fechas a la misma zona horaria (Argentina)
 const timeZoneOffset = today.getTimezoneOffset() * 60000; // Offset en milisegundos
 const todayInArgentina = new Date(today.getTime() + timeZoneOffset - (3 * 3600000)); // Ajuste de 3 horas
 const targetDateInArgentina = new Date(targetDate.getTime() + timeZoneOffset - (3 * 3600000));

const difference = targetDateInArgentina.getTime() - todayInArgentina.getTime();

    
    // Asegúrate de que la diferencia es positiva
    if (difference < 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }

    // Convertir la diferencia en días, horas, minutos y segundos
    const totalSeconds = Math.floor(difference / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    // Calcular los valores residuales
    const seconds = totalSeconds % 60;
    const minutes = totalMinutes % 60;
    const hours = totalHours % 24;

    return {
        totalMilliseconds: difference,
        days: totalDays,
        hours,
        minutes,
        seconds
    };
}

/* // Ejemplo de uso
console.log(dateDiff("2024-08-03", "04:40")); */

function renderEvents() {
    if(events.length===0){
        eventContainer.innerHTML=
        `
        <div class="vacio">
        <h1>NO HAY EVENTOS PROXIMOS</h1>
        </div>
        
        `;
        return;
    }

    const eventsHTML=events.map(event=>{
        const diff = dateDiff(event.date,event.time);
        console.log(`Color del evento (${event.id}): ${event.color}`);
        const isNear = diff.totalMilliseconds <= (24 * 60 * 60 * 1000) && diff.totalMilliseconds >= 0;
        const eventClass = isNear ? 'event-red' : 'event-custom'; // Usa clase CSS // Verifica el color

        const isRainy = event.weather && event.weather.description.toLowerCase().includes('rain');
        const isCloudy = event.weather && event.weather.description.toLowerCase().includes('cloud');
        
   
        return `
        <div class="event ${eventClass}" id="event-${event.id}" style="border-left: 5px solid ${event.color};">
            <div class="days">
                <span class="days-number">${diff.days}</span>
                <span class="days-text">días</span>
            </div>
            <div class="time">
            <div class="time-numbers">
            
            <span class="time-number">${diff.hours}</span>:<span class="time-number">${diff.minutes}</span>:<span class="time-number">${diff.seconds}</span>
            </div>
                
                <div>
                <span class="time-text">horas minutos segundos</span>
                
                </div>
            </div>
            <div class="event-name"style="width:280px">
             <div class="event-header" style="display: flex; align-items: center;">
                <div class="color-circle" style="width: 10px; height: 8px; background-color: ${event.color}; border-radius: 50%; margin-right: 0px;margin-left:30px"></div>
                <div class="event-name"style=>${event.name}</div>
            </div>
      
            
            
            </div>
            <div class="event-date">${event.date}</div>
            <div class="event-time">${event.time}</div>
            ${event.weather ? `
            <div class="event-weather">
                <img src="http://openweathermap.org/img/w/${event.weather.icon}.png" alt="${event.weather.description}">
                <span>${event.weather.temp}°C, ${event.weather.description}</span>
            </div>
            ` : ''}
           ${isRainy ? `
        <div class="rain">
            ${Array.from({length: 50}).map((_, i) => `<div class="raindrop" style="left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 2}s;"" ></div>`).join('')}
        </div>
        ` : ''}
        ${isCloudy ? `
        <div class="clouds">
   
    <img src="nubes-tormenta.jpg" class="cloud">
   
</div>
` : ''}
     
            <div class="actions">
                <button class="bDelete" data-id="${event.id}"><i class="bi bi-trash custom-icon"></i></button>
            </div>
        </div>
        
        `;

        
    })
   

    eventContainer.innerHTML=eventsHTML.join("");
    if(renderEvents===""){

    }
    
    document.querySelectorAll(".bDelete").forEach(button=>{
        button.addEventListener("click",e=>{
            Swal.fire({
                title: "Estas Seguro?",
                text: "¡No podrás revertir esto!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Si,elimina esto!"
              }).then((result) => {
                if (result.isConfirmed) {
                    const id=button.getAttribute("data-id");
                    events=events.filter(event=>event.id!=id);
                    save(JSON.stringify(events));
        
                    renderEvents();
                    updateCalendarEvents();
                  Swal.fire({
                    title: "Eliminado!",
                    text: "Su evento a sido eliminado.",
                    icon: "success"
                  });
                }else{


                }
              });
            // va a filtrar y va a buscar en mi array todos los elementos en donde el id sea diferente al id que estoy obteniendo

        })
    })
    
}


function updateEventTimes() {
    // Actualizar el tiempo restante de cada evento
    events.forEach(event => {
        const eventElement = document.getElementById(`event-${event.id}`);
        if (eventElement) {
            const diff = dateDiff(event.date,event.time);
            eventElement.querySelector('.days-number').textContent = diff.days;
            eventElement.querySelector('.time-number:nth-of-type(1)').textContent = diff.hours;
            eventElement.querySelector('.time-number:nth-of-type(2)').textContent = diff.minutes;
            eventElement.querySelector('.time-number:nth-of-type(3)').textContent = diff.seconds;
        }
    });
}


loadEvents()
function save(data) {
    localStorage.setItem("items",data);
    
}

function load() {
    return localStorage.getItem("items");
    
}

// Inicializar la carga de eventos al cargar la página
window.addEventListener('load', () => {
    loadEvents();
    setInterval(updateEventTimes, 1000); // Actualizar cada segundo
}); 

//Manejo del formulario para agregar eventos
document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
}); 
    
    const swiper = new Swiper('.slider-wrapper', {
    
        loop: true,
        grabCursor:true,
        spaceBetween:30,
      
        // If we need pagination
        pagination: {
          el: '.swiper-pagination',
          clickable:true,
        },
      
        // Navigation arrows
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },

        breakpoints:{
            0:{
                slidesPerView:1
            },
            620:{
                slidesPerView:2
            },
            1024:{
                slidesPerView:3
            }
        }
      
     
      });