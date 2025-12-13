from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, EmailOTP, PasswordResetToken
from .serializer import *
from .utils import send_otp_email

class RegisterAPI(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        
        # Create and send OTP
        otp = EmailOTP.objects.create(email=user.email)
        send_otp_email(user.email, otp.otp)
        
        return Response({
            'detail': 'OTP sent to email. Verify to complete registration.',
            'email': user.email,
            'otp_expires_in_seconds': 300
        }, status=status.HTTP_201_CREATED)

class VerifyRegistrationAPI(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            otp_obj = EmailOTP.objects.get(
                email=serializer.validated_data['email'],
                otp=serializer.validated_data['otp']
            )
            
            if not otp_obj.is_valid():
                return Response({'detail': 'OTP expired or invalid'}, status=status.HTTP_400_BAD_REQUEST)
            
            # activelogin user
            user = User.objects.get(email=otp_obj.email)
            user.is_active = True
            user.is_email_verified = True
            user.save()
            
            # used otp
            otp_obj.is_used = True
            otp_obj.save()
            
            return Response({'detail': 'Email verified and user activated.'}, status=status.HTTP_200_OK)
            
        except EmailOTP.DoesNotExist:
            return Response({'detail': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ResendOTPAPI(APIView):
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        
        # new otp creation
        otp = EmailOTP.objects.create(email=email)
        send_otp_email(email, otp.otp)
        
        return Response({'detail': 'OTP resent if allowed.'}, status=status.HTTP_200_OK)

class LoginAPI(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)

class ForgotPasswordRequestAPI(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        if User.objects.filter(email=email).exists():
            otp = EmailOTP.objects.create(email=email)
            send_otp_email(email, otp.otp)
            return Response({
                'detail': 'an OTP has been sent to email.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'detail': 'the email is not exist'
            }, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordVerifyAPI(APIView):
    def post(self, request):
        serializer = ForgotPasswordVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            otp_obj = EmailOTP.objects.get(
                email=serializer.validated_data['email'],
                otp=serializer.validated_data['otp']
            )
            
            if not otp_obj.is_valid():
                return Response({'detail': 'OTP expired or invalid'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.get(email=otp_obj.email)
            reset_token = PasswordResetToken.objects.create(user=user)
            
            otp_obj.is_used = True
            otp_obj.save()
            
            return Response({
                'detail': 'OTP verified.',
                'reset_token': reset_token.token,
                'expires_in_seconds': 900
            }, status=status.HTTP_200_OK)
            
        except EmailOTP.DoesNotExist:
            return Response({'detail': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        

class ForgotPasswordResetAPI(APIView):
    def post(self, request):
        serializer = ForgotPasswordResetSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reset_token = PasswordResetToken.objects.get(
                token=serializer.validated_data['reset_token']
            )
            
            if not reset_token.is_valid():
                return Response({'detail': 'Reset token expired or invalid'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = reset_token.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            reset_token.used = True
            reset_token.save()
            
            return Response({'detail': 'Password updated successfully.'}, status=status.HTTP_200_OK)
            
        except PasswordResetToken.DoesNotExist:
            return Response({'detail': 'Invalid reset token'}, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'detail': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)

class UserProfileAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)