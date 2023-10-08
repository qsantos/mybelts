import logging
from typing import Any

from flask import Flask, Response, request, send_file, send_from_directory

from mybelts.api import blueprint as api_blueprint
from mybelts.schema import HTTPRequest, session_context


def create_app() -> Flask:
    app = Flask(__name__, static_folder='../front/build', static_url_path='/')
    app.config['ERROR_404_HELP'] = False
    app.config['SWAGGER_UI_DOC_EXPANSION'] = 'list'
    app.register_blueprint(api_blueprint, url_prefix='/api')

    @app.route('/')
    @app.route('/belts')
    @app.route('/skill-domains')
    @app.route('/class-levels')
    @app.route('/class-levels/<path:x>')
    @app.route('/school-classes')
    @app.route('/school-classes/<path:x>')
    @app.route('/students')
    @app.route('/students/<path:x>')
    @app.route('/users')
    @app.route('/i18n')
    def home(_x: str = '', _y: str = '', _z: str = '') -> Any:
        return send_file('../front/build/index.html')

    @app.route('/.well-known/<path:path>')
    def well_known(path: str) -> Any:
        return send_from_directory('.well-known', path)

    if app.debug:
        logging.basicConfig()
        logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

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
