# Copyright (C) 2018-2022 Intel Corporation
#
# SPDX-License-Identifier: MIT

# Inherit parent config
from .base import *  # pylint: disable=wildcard-import

DEBUG = False

NUCLIO["HOST"] = os.getenv("CVAT_NUCLIO_HOST", "nuclio")

# Django-sendfile:
# https://github.com/moggers87/django-sendfile2
SENDFILE_BACKEND = "django_sendfile.backends.nginx"
SENDFILE_URL = "/"

LOGGING["formatters"]["verbose_uvicorn_access"] = {
    "()": "uvicorn.logging.AccessFormatter",
    "format": '[{asctime}] {levelprefix} {client_addr} - "{request_line}" {status_code}',
    "style": "{",
}
LOGGING["handlers"]["verbose_uvicorn_access"] = {
    "formatter": "verbose_uvicorn_access",
    "class": "logging.StreamHandler",
    "stream": "ext://sys.stdout",
}
LOGGING["loggers"]["uvicorn.access"] = {
    "handlers": ["verbose_uvicorn_access"],
    "level": "INFO",
    "propagate": False,
}

# https://github.com/pennersr/django-allauth
ACCOUNT_AUTHENTICATION_METHOD = "username_email"
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = "mandatory"

# Email backend settings for Django
if os.getenv("EMAIL_HOST"):
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = os.getenv("EMAIL_HOST")
    EMAIL_PORT = os.getenv("EMAIL_PORT")
    EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
    EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
    EMAIL_USE_TLS = to_bool(os.getenv("EMAIL_USE_TLS"))
    EMAIL_USE_SSL = to_bool(os.getenv("EMAIL_USE_SSL"))
    EMAIL_TIMEOUT = os.getenv("EMAIL_TIMEOUT")
    DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL")
