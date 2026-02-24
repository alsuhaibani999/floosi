# SMS Application

## Description
This SMS Application is designed to facilitate financial transactions and notifications via SMS. It aims to provide a user-friendly interface for managing finances through simple text messages.

## Features
- Send and receive SMS notifications for transactions.
- Track expenses and income through text commands.
- Real-time updates for user accounts.
- Secure communication using encryption.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/alsuhaibani999/floosi.git
   ```
2. Navigate to the project directory:
   ```bash
   cd floosi
   ```
3. Install the necessary dependencies:
   ```bash
   npm install
   ```

## Usage
To start the application, run:
```bash
npm start
```

Send commands via SMS to interact with the application. For example:
- To check your balance: "Balance"
- To add expense: "Add Expense 50 for groceries"

## API Reference
- **POST /sms/send**: Endpoint to send an SMS notification.
- **GET /sms/transactions**: Retrieve a list of recent transactions.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue to discuss.

## License
This project is licensed under the MIT License. See the LICENSE file for details.