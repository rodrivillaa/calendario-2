// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const webpush = require('web-push');
const app = express();

// Usa CORS para permitir solicitudes desde cualquier origen
app.use(cors({
    origin: '*', // O el origen desde el que estás haciendo la solicitud
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type'
}));
app.use(bodyParser.json());

// Configura las claves VAPID para la autenticación
const vapidKeys = {
    publicKey: 'BPNpkbBph-CQeyn5rOAWohgCitrTOQ1u68z_gmTgVMoQ5sHSVLHfHbhOTn4fvQYnMKr04GppK85bHkcye9VjWmE',
    privateKey: 'qL5omy9SGa4MDwiLJHZURhEPZEOei-QnFJtC-rBZejY'
};

webpush.setVapidDetails(
    'mailto:rodrivillaa23@gmail.com', // Cambia esto por tu dirección de correo electrónico
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

app.get('/', (_, res) => {
    res.send('Bienvenido al servidor de suscripciones.');
});

app.post('/subscribe', (req, res) => {
    console.log('Solicitud POST recibida en /subscribe');
    console.log('Cuerpo de la solicitud:', req.body);
    const subscription = req.body;
    console.log('Suscripción recibida:', subscription);

    // Envía una notificación de prueba
    const payload = JSON.stringify({
        title: 'Notificación de Prueba',
        body: '¡Hola, esta es una notificación de prueba!'
    });

    webpush.sendNotification(subscription, payload)
        .then(response => {
            console.log('Notificación enviada:', response);
            res.status(200).json({ success: true });
        })
        .catch(error => {
            console.error('Error al enviar la notificación:', error);
            res.status(500).json({ error: 'Error al enviar la notificación' });
        });
});

app.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});