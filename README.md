# Kobo Document Scanner

## Overview

Kobo Document Scanner is a mobile application that integrates with the KoboCollect app to scan documents and send the data back to KoboCollect. The application is built using Angular and Capacitor.

## Features

*   Document scanning using BlinkID
*   Theme switching between light and dark modes
*   Integration with KoboCollect for data transmission

## Prerequisites

*   [Node.js](https://nodejs.org/) (version 14 or later)
*   [Angular CLI](https://angular.io/cli)
*   [Capacitor CLI](https://capacitorjs.com/docs/getting-started)

## Setup

1.  **Clone the repository:**

        git clone https://github.com/yourusername/kobo-document-scanner.git
        cd kobo-document-scanner

2.  **Install dependencies:**

        npm install

3.  **Build the Angular project:**

        ng build

4.  **Add Capacitor platforms:**

        npx cap add android

5.  **Sync Capacitor with the project:**

        npx cap sync android

## Development

### Running the Application

1.  **Serve the Angular application:**

        ng serve

    Open your browser and navigate to [http://localhost:4200](http://localhost:4200).

2.  **Run the application on an Android device or emulator:**

        npx cap open android

    Build and run the project from Android Studio.

### Building for Production

1.  **Build the Angular project for production:**

        ng build --configuration production

2.  **Sync Capacitor with the project:**

        npx cap sync android

## Contributing

1.  Fork the repository
2.  Create a new branch (`git checkout -b feature/your-feature-name`)
3.  Make your changes
4.  Commit your changes (`git commit -am 'Add some feature'`)
5.  Push to the branch (`git push origin feature/your-feature-name`)
6.  Create a new Pull Request

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contact

For any inquiries or issues, please contact [nawaa@unhcr.org](mailto:nawaa@unhcr.org).