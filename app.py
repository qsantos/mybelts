import logging
from time import sleep
from typing import Any

from flask import Flask, Response, request, send_file

from mybelts.api import blueprint as api_blueprint
from mybelts.schema import HTTPRequest, session_context


def create_app() -> Flask:
    app = Flask(__name__, static_folder='build', static_url_path='/')
    app.config['ERROR_404_HELP'] = False
    app.config['SWAGGER_UI_DOC_EXPANSION'] = 'list'
    app.register_blueprint(api_blueprint, url_prefix='/api')

    @app.route('/')
    @app.route('/<x>')
    def home(x: str = '') -> Any:
        return send_file('build/index.html')

    if app.debug:
        logging.basicConfig()
        logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

        @app.before_request
        def wait() -> None:
            sleep(.3)

        @app.after_request
        def save_http_request(response: Response) -> Response:
            with session_context() as session:
                http_request_response = HTTPRequest(
                    request_remote_addr=request.remote_addr,
                    request_method=request.method,
                    request_url=request.url,
                    request_path=request.path,
                    request_headers=dict(request.headers),
                    request_body=request.data,
                    response_status_code=response.status_code,
                    response_status=response.status,
                    response_headers=dict(response.headers),
                    # response_body=response.data,
                )
                session.add(http_request_response)
                session.commit()
            return response

    return app


if __name__ == '__main__':
    application = create_app()
    application.run()
