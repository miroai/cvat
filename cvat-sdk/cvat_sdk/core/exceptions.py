# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT


class CvatSdkException(Exception):
    """Base class for SDK exceptions"""


class InvalidHostException(CvatSdkException):
    """Indicates an invalid hostname error"""


class IncompatibleVersionException(CvatSdkException):
    """Indicates server and SDK version mismatch"""


class BackgroundRequestException(CvatSdkException):
    """
    Exception is raised when a background request fails
    """
