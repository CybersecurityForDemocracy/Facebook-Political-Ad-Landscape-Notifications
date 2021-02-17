# Facebook-Political-Ad-Landscape-Notifications
Code for Facebook Political Ad Landscape Notifications project

This project contains 3 components:
* `frontend/` frontend and middleware code. The Frontend is react, and requires
  a Django middleware for user session management. This ran on Heroku.
* `ad_observatory_api_backend/` API backend code. Flask app that ran on AWS
  Elastic Beanstalk.
* `AdObservatoryNotifications/` Notification engine. Analyzes database data and
  sends notifications. This ran on a EC2 instance.

See README in each component's dir for info on how to run it.
