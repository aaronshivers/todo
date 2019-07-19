# Todo Application

## Installation

### Clone Repository
```
git clone git@github.com:aaronshivers/todo.git
```

### Install Dependencies
Move into the project directory
```
cd todo
```
then
```
npm i
```

### Add Environment Variables
Create a file called .env in the root directory
```
touch .env
```
add the following variables
* PORT
* JWT_SECRET
* MONGO_COLLECTION
* MONGO_PASS
* MONGO_SERVER
* MONGO_USER
* POSTMARK_TOKEN

### Start Application
```
npm start
```

## Testing

### Start Tests
```
npm run test
```
or
```
npm run test-watch
```
