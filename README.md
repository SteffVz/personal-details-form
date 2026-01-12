# Personal Details Form

A Node.js application that collects personal details via an HTML form and stores them in MongoDB with validation.

## Features

- HTML form for user input:
  - Name
  - Surname
  - ID Number
  - Date of Birth
- Server-side validation:
  - Name and Surname only allow letters, spaces, hyphens, and apostrophes
  - ID Number must be exactly 13 digits
  - Duplicate ID Numbers are not allowed
- MongoDB integration for storing submissions
- Basic POST and GET handling using Node.js HTTP module

## Requirements

- Node.js (v14+ recommended)
- MongoDB (local or cloud)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/personal-details-form.git
