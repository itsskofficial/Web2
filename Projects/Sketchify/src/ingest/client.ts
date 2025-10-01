import { Ingest } from "ingest-sdk";

export const ingest = new Ingest({
    // Use the Ingest Event Key from your environment variables
    eventKey: process.env.INGEST_EVENT_KEY,
    // Use the Ingest Signing Key from your environment variables
    signingKey: process.env.INGEST_SIGNING_KEY,
});