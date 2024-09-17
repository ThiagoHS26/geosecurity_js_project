# GEOmaps - Sistema de Predicción de Crímenes

## --------------------------------------------------------------------------------------------------------##

## Primera versión

## Descripción
Este proyecto es un sistema de predicción de crímenes que utiliza datos geoespaciales para mostrar incidentes en un mapa interactivo. La aplicación incluye funciones como la carga masiva de datos, clustering de incidentes y análisis geoespacial. A medida que avanza el desarrollo del proyecto se irá añadiendo más funcionalidades, como predicciones futuras, buzon de sugerencias, alertas y notificaciones.

## Funcionalidades
- Registro individual y carga masiva de crímenes.
- Visualización en mapa con Leaflet.
- Autenticación de usuario con Google OAuth.
- Clustering de incidentes con DBSCAN.

## Instalación
1. Clona el repositorio:
   git clone https://github.com/ThiagoHS26/geosecurity_js_project.git
2. Instala las dependencias
    npm install
3. Configura las variables de entorno en un archivo .env
    PORT = tu-puerto-predeterminado
    MONGO_URI = mongodb+srv://tu-base-mongo
    GOOGLE_CLIENT_ID = tu-cliente-id
    GOOGLE_CLIENT_SECRET = tu-cliente-secret
    SESSION_SECRET = clave-inicio-sesion

## Manual de Usuario (Resumido)
1.  Inicia sesión con tu cuenta de Google.
2.  Añade un incidente criminalistico.
3.  Utiliza el botón para obtener la ubicación de tu dispositivo (Habilita los permisos en tu navegador).
4.  Verifica en el mapa la información.
5.  El clustering de incidentes con DBSCAN iniciará con almenos 3 registros.
6.  Con un click en el marcador puedes visualizar en una ventana modal los datos registrados anteriormente.
7.  Puedes escoger entre eliminar o editar el registro.