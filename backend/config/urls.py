"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Serve static files in development (though Whitenoise handles it in prod)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])

# Catch-all for React router (must be at the end, and should ideally avoid catching static files)
# We use a regex that ignores any URL starting with /static/, /assets/, /api/, or /admin/
urlpatterns += [
    re_path(r'^(?!/?static/)(?!/?assets/)(?!/?api/)(?!/?admin/).*$', TemplateView.as_view(template_name='index.html')),
]
