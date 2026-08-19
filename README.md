# Expres Car Wash

Aplicación web de lavado de autos a domicilio con sistema de reservas, pagos y recordatorios automáticos.

## Características

- 🚗 Reservas de lavado por tamaño de auto
- 📅 Sistema de calendario interactivo
- 💳 Múltiples opciones de pago
- 📧 Recordatorios automáticos 3 horas antes
- 📱 Interfaz responsiva
- 🔐 Panel admin protegido

## Requisitos

- Node.js 14+
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm start
```

La app se abrirá en http://localhost:3000

## Build para producción

```bash
npm run build
```

## Despliegue en Netlify

1. Crea un repositorio en GitHub
2. Conecta el repo a Netlify
3. Netlify detectará automáticamente que es un proyecto React y lo desplegará

## Variables de entorno

En `src/App.jsx`, actualiza la variable `API_BASE` con la URL de tu servidor:

```javascript
const API_BASE = "https://tu-servidor.herokuapp.com";
```

## Tecnologías

- React 18
- Lucide Icons
- CSS Vanilla

## Licencia

Privado
