# CharacterGenV3_Offline

## Getting Started

Follow the instructions below to set up and run the project on your local machine.

### Prerequisites

- Ensure you have Node.js installed on your machine.

### Installation

1. **Clone the repository**:

   git clone https://github.com/b0ney-1/CharacterGenV3_Offline.git

2. **Navigate into the project's directory**:

   cd CharacterGenV3_Offline

3. **Install all dependencies**:

   npm install

### Storj Setup

Before using the project, set up Storj for storing the generated images and metadata:

1. **Sign Up / Log In to Storj**:

   - Go to Storj and sign up or log in.

2. **Create S3 Credentials**:

   - Navigate to the Access section.
   - Create a new access key of type "S3 Credentials".
   - Note down the Access Key, Secret Access Key, and Endpoint URL.

3. **Create a Bucket**:

   - Go to the Browse section.
   - Click on the New Bucket button and create a new bucket.
   - Note down the Bucket Name.

4. **Get the Bucket ID**:
   - Click on the created bucket.
   - Click on the Settings button at the top.
   - Select the option to Share the bucket.
   - Note down the Bucket ID.

### Configure Environment Variables

Create a .env file in the root directory of the project and add the following variables:

STORJ_ENDPOINT_URL=<Your_Storj_Endpoint_URL>
STORJ_ACCESS_KEY_ID=<Your_Storj_Access_Key_ID>
STORJ_SECRET_ACCESS_KEY=<Your_Storj_Secret_Access_Key>
STORJ_BUCKET_NAME=<Your_Storj_Bucket_Name>
BUCKET_ID=<Your_Storj_Bucket_ID>

### Usage

1. **Run the Image and Metadata Generator**:

   node generate.js

2. **Once the process completes, the metadata and images will be generated in the project directory under two folders named**:

   - generated_images
   - generated_metadata

Now you're all set to use the project! Enjoy generating your images and metadata.
