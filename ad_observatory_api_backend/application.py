"""Main server entrypoint.

- Registers blueprints for Ad Screener and Ad Observatory API.
- Implements and registers login manager handlers for loading users and handling API keys.
- Other miscellaneous initializations.
"""
import logging
import os
import os.path
import sys

from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager

from blueprints.ad_observatory_api import ad_observatory_api
from blueprints.ad_screener import ad_screener_core
from common import authentication

def init_server(server_mode, login_manager):
    ad_observatory_api_app = Flask(__name__)
    ad_observatory_api_app.register_blueprint(ad_screener_core.blueprint,
                                              url_prefix=ad_observatory_api.URL_PREFIX)
    ad_observatory_api_app.register_blueprint(ad_observatory_api.blueprint,
                                              url_prefix=ad_observatory_api.URL_PREFIX)

    login_manager.init_app(ad_observatory_api_app)
    login_manager.user_loader(ad_observatory_api.load_user)
    login_manager.request_loader(ad_observatory_api.load_api_user_from_request)

    if 'DEBUG_CORS' in os.environ and os.environ['DEBUG_CORS']:
        logging.getLogger('flask_cors').level = logging.DEBUG
    # TODO(macpd): figure out CSRF if we're gonna pass credentials
    CORS(ad_observatory_api_app,
         supports_credentials=True,
         origins=["https://sleepy-falls-01942.herokuapp.com",
                  "https://dev.ad-screener.ad-observatory.com",
                  "https://adobservatory.org",
                  "https://www.adobservatory.org",
                  "https://dev.adobservatory.org",
                  "https://adobservatory.netlify.app",
                  # Regex to match Netlify preview deploys
                  r"https://[^.]+-adobservatory.netlify.app",
                  "http://localhost:5000",
                  "http://localhost:3000"])


    ad_observatory_api_app.config['REMEMBER_COOKIE_SECURE'] = True
    ad_observatory_api_app.secret_key = bytes(os.environ['FLASK_APP_SECRET_KEY'], encoding='utf-8')

    authentication.oauth.init_app(ad_observatory_api_app)

    logging.debug('Route map: %s', ad_observatory_api_app.url_map)

    return ad_observatory_api_app

app_login_manager = LoginManager()
app = init_server(SERVER_MODE, app_login_manager)


if __name__ == '__main__':
    logging.getLogger().setLevel(logging.DEBUG)
    app.run(debug=True)
