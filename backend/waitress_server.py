import os
from waitress import serve
from config.wsgi import application

if __name__ == '__main__':
    # Azure passes the port in HTTP_PLATFORM_PORT when using HttpPlatformHandler
    # Or default to 8000
    port = int(os.environ.get('HTTP_PLATFORM_PORT', 8000))
    print(f"Starting Waitress server on port {port}...")
    serve(application, host='0.0.0.0', port=port)
