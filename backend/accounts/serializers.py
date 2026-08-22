from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'role']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
            "role",
        ]
        extra_kwargs = {
            "password": {
                "write_only": True
            }
        }

    def create(self, validated_data):

        user = User.objects.create_user(
            **validated_data
        )

        return user

class StudentListSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username"]


class AllUsersListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
        ]

class AdminUserEditSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "password",
        ]

        read_only_fields = [
            "id",
        ]

    def update(self, instance, validated_data):

        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        return instance