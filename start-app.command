#!/bin/bash
# Script para iniciar partes-app
cd "$(dirname "$0")"

echo "============================================="
echo "   Iniciando Partes App (Servidor Local) "
echo "============================================="
echo "La aplicación se abrirá en tu navegador..."
echo "Cierra esta ventana para detener la aplicación."
echo ""

# Ejecutamos npm run dev
# Asegúrate de haber ejecutado 'npm install' al menos una vez antes
npm run dev &
sleep 5
ngrok http 5173
