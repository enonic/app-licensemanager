License Manager Application for Enonic XP
=========================================

<img align="right" alt="License Manager Logo" width="128" src="./src/main/resources/application.svg">

License Manager is an XP tool that can be used by application developers to control where and how their applications are able to run.

## Building and deploying

Build this application from the command line. Go to the root of the project and enter:

    ./gradlew clean build

To deploy the app, set `$XP_HOME` environment variable and enter:

    ./gradlew deploy


## Documentation

[See documentation for License Manager and the license library here.](https://github.com/enonic/lib-license/blob/master/docs/index.adoc)
