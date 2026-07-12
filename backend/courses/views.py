from rest_framework import generics
from accounts.models import Enrolment
from .serializers import EnrolmentSerializer

from rest_framework.permissions import IsAuthenticated

# Create your views here.


class MyEnrolmentsView(generics.ListAPIView):
    serializer_class = EnrolmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrolment.objects.filter(student=self.request.user)
