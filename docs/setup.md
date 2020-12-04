### First time setup
Create file 'secrets.json' at the root directory

The contents of this file with be a json of the form below. Fill in the values with your local PostgreSQL credentials
```
{
  username: x,
  password: y,
  db_port: 5432,
  session_secret: z
}
```

Then, run ```npm install```

The project is ready to be run! Execute the below command to run our application locally.

```npm run start```
