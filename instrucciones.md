# Instalar nginx

sudo apt install nginx

# Cargar Archivos Server

1) Verifica dónde está tu proyecto
ls -la /home/root


Debes ver:

Calibrador-Modbus

2) Crear el enlace simbólico para que sea la HOME (/)

Esto hace que Nginx sirva tu repo directamente en /.

sudo rm -rf /var/www/html
sudo ln -s /home/root/Calibrador-Modbus /var/www/html


Verifica:

ls -la /var/www


Debe salir:

html -> /home/root/Calibrador-Modbus

3) Dar permisos para que Nginx pueda leer

Como tu proyecto está dentro de /home/root, hay que permitir “entrar” a esa carpeta y leer archivos.

sudo chmod o+rx /home/root
sudo chmod -R o+rX /home/root/Calibrador-Modbus


Verifica permisos del camino:

namei -l /var/www/html/index.html


Lo importante es que el directorio /home/root tenga x (permiso de ejecución) para “others”.
En tu salida aparece:

drwx---r-x root root   root


Eso significa que “others” tiene x, así que ✅.

4) Configurar Nginx (sitio)

Crea/edita este archivo:

sudo nano /etc/nginx/sites-available/calibrador


Pega esto:

server {
  listen 80;
  server_name _;

  root /var/www/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:1880/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}

5) Habilitar el sitio y deshabilitar el default
sudo ln -sf /etc/nginx/sites-available/calibrador /etc/nginx/sites-enabled/calibrador
sudo rm -f /etc/nginx/sites-enabled/default

6) Probar y recargar Nginx
sudo nginx -t
sudo systemctl reload nginx