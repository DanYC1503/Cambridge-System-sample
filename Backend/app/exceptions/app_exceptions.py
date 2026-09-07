class AppException(Exception):
    def __init__(self, message: str, status_code: int):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class FormNotFoundException(AppException):
    def __init__(self):
        super().__init__("Form not found", 404)


class InvalidFormException(AppException):
    def __init__(self, message: str):
        super().__init__(message, 400)


class FormSubmissionException(AppException):
    def __init__(self, message: str):
        super().__init__(message, 422)