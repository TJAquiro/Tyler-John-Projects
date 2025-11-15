This is the directory containing the CS 321 project for Jessica Taylor, Tyler Aquiro, Jay Ingle, Hugh French, Anthony Mejia, and Michael Nguyen.

To run the backend:
- Go into the backend directory
- Change DB_PASSWORD in ".env" to your MySQL server password
- Run "yarn", then run "yarn tsx src/server.ts"

To load example data into the database:
- Make sure the backend is not running
- Open MySQL Workbench
- Run the command "drop database shoppingtime;"
- Run the command "create database shoppingtime;"
- Run the backend
- Open a new terminal tab
- Change working directory to the initialize-db directory
- Run the initialize-db.ps1 powershell script
    - If you are on Windows, you can just type "./initialize-db.ps1" from a Powershell terminal
    - If you are on some other OS, install powershell for that OS

To run the frontend:
- Go into the shopping-time directory
- Run "yarn", then run "yarn dev"
