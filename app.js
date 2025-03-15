const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { default: mongoose } = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

let events = [];

app.use(
    '/api',
    graphqlHTTP({
        schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String
                price: Float
                date: String
            }

            input EventInput {
                title: String!
                description: String
                price: Float
                date: String
            }

            type RootQuery {
                events: [Event!]!
            }
            
            type RootMutation {
                createEvent(eventInput: EventInput): Event
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }    
        `),
        rootValue: {
            events: () => {
                return events;
            },
            createEvent: (args) => {
                const event = {
                    _id: Math.random().toString(36).substr(2, 9),
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date().toISOString(),
                };
                events.push(event);
                return event;
            }
        },
        graphiql: true,
    }));

app.get('/health', (req, res, next) => {
    res.send('Hello, GraphQL API!');
});

async function connectDatabase() {
    const DB_NAME = 'graphql_events';
    const DB_PATH = `${process.env.MONGODB_URI}/${DB_NAME}`;
    // console.log("DB_PATH: ", DB_PATH);
    const connectionInstance = await mongoose.connect(`${DB_PATH}`);
    console.log(
        `======================== \nMongoDB connected...!! \nDB HOST: ${connectionInstance.connection.host}\nDB HOST: ${connectionInstance.connection.name}\n========================`
    );
}

connectDatabase();