// Importing required libraries
const express = require('express'); // Express framework to create a web server
const { ApolloServer } = require('@apollo/server'); // ApolloServer to handle GraphQL requests
const { expressMiddleware } = require('@apollo/server/express4'); // Apollo server middleware for Express
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies
const cors = require('cors'); // CORS middleware to handle cross-origin requests
const { default: axios } = require('axios'); // Axios for making HTTP requests

// Asynchronous function to initialize and start the server
async function startServer() {
    const app = express(); // Create an Express application instance

    // Create a new Apollo Server instance with type definitions and resolvers
    const server = new ApolloServer({
        typeDefs: `
            # Define a 'User' type with the fields id, name, username, email, phone, and todo
            type User{
                id: ID!
                name: String!
                username: String!
                email: String!
                phone: String!
                todo: Todo
            }   

            # Define a 'Todo' type with the fields id, title, completed, and user
            type Todo{
                id: ID!
                title: String!
                completed: Boolean
                user: User
            }

            # Define a 'Query' type with three query operations
            type Query{
                getTodos: [Todo]          # Get all Todo items
                getAllUsers: [User]       # Get all Users
                getUser(id: ID!): User    # Get a specific User by ID
            }
        `,
        resolvers: {
            // Resolver for 'Todo' type's 'user' field
            Todo: {
                user: async (todo) => {
                    // Log the todo to check the data
                    console.log(todo);
                    // Fetch the user associated with the Todo item by making an HTTP request to the API
                    return (await axios.get(
                        `https://jsonplaceholder.typicode.com/users/${todo.id}`
                    )).data;
                }
            },

            // Resolvers for the 'Query' type
            Query: {
                // 'getTodos' query that fetches all Todo items from the API
                getTodos: async () => {
                    // Make a GET request to the API to fetch all Todo items
                    return (await axios.get('https://jsonplaceholder.typicode.com/todos')).data;
                },
                // 'getAllUsers' query that fetches all Users from the API
                getAllUsers: async () => {
                    // Make a GET request to the API to fetch all Users
                    return (await axios.get('https://jsonplaceholder.typicode.com/users')).data;
                },
                // 'getUser' query that fetches a specific User by their ID
                getUser: async (parent, { id }) => {
                    // Make a GET request to the API to fetch the User with the given ID
                    return (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data;
                }
            },

            // Resolver for 'User' type's 'todo' field
            User: {
                todo: async (user) => {
                    // Fetch the Todo associated with the User using their ID
                    return (await axios.get(`https://jsonplaceholder.typicode.com/todos/${user.id}`)).data;
                }
            }
        }
    });

    // Set up middlewares
    app.use(bodyParser.json());  // Middleware to parse incoming requests with JSON payloads
    app.use(cors());             // Middleware to allow cross-origin resource sharing (CORS)

    // Start the Apollo Server and make it ready to handle GraphQL requests
    await server.start();

    // Use the Apollo Server middleware to handle requests at the '/graphql' endpoint
    app.use("/graphql", expressMiddleware(server));

    // Start the Express server to listen on port 8000
    app.listen(8000, () => console.log('Server running at port 8000'));
}

// Start the server by calling the asynchronous function
startServer();
