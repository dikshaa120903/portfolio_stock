from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register_user, name='register'),
    path('portfolio/', views.portfolio, name='portfolio'),
    path('clustering/', views.clustering, name='clustering'),
    path('predictions/', views.predictions, name='predictions'),
    path('stocks/<str:symbol>/', views.stock_details, name='stock_details'),
    path('sectors/', views.sectors, name='sectors'),
    path('gold-silver-correlation/', views.gold_silver_correlation, name='gold_silver_correlation'),
    path('forecast/', views.forecast, name='forecast'),
    path('prediction/', views.prediction, name='prediction'),
]
