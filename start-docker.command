#!/bin/bash
# Script para iniciar partes-app con Docker
cd "$(dirname "$0")"

echo "============================================="
echo "   Iniciando Partes App (DOCKER) "
echo "============================================="
echo "Levantando contenedores..."
echo ""

# Cleanup ports if occupied (prevents "Address already in use" errors)
echo "Verificando puertos..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "ERROR: Docker no está ejecutándose."
  echo "Por favor, abre Docker Desktop y vuelve a intentar."
  read -p "Presiona Enter para salir..."
  exit 1
fi

docker compose up -d --build

echo ""
echo "============================================="
echo "   ¡Aplicación Iniciada! "
echo "============================================="
echo "1. Tu App Local: http://localhost:5173"
echo "2. URL Pública: Mira abajo (donde pone 'forwarding')"
echo "3. Panel Ngrok: http://localhost:4040"
echo "============================================="
echo ""
echo "Para ver la URL pública, espera unos segundos..."
# Fetch Ngrok URL
echo "Esperando a que Ngrok inicie..."
sleep 5
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok[^"]*')

if [ -n "$PUBLIC_URL" ]; then
    echo "TU URL PÚBLICA: $PUBLIC_URL"
    echo ""
    echo "PARA USAR 'appgest.com':"
    echo "1. Abre una nueva terminal."
    echo "2. Copia y pega esto (te pedirá contraseña):"
    echo "   sudo -- sh -c \"echo '127.0.0.1 appgest.com' >> /etc/hosts\""
    echo "3. Luego entra en: http://appgest.com:5173"
else 
    echo "No se pudo detectar la URL pública automáticamente."
    echo "Revisando logs por si hubo error de dominio..."
    docker compose logs ngrok | tail -n 10
fi

echo ""
echo "Cierra esta ventana para dejarlo corriendo en segundo plano."
echo "Para detenerlo, ejecuta 'docker compose down' o usa Docker Desktop."
