from django.shortcuts import redirect

def home_redirect(request):
    return redirect('/api/accounts/user-fields')