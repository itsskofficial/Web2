import { serve } from "ingest-next";
import { ingest } from "@/ingest/client";
import { handlePolarWebhook } from "@/ingest/functions";

export const { GET, POST, PUT } = serve(ingest, [
    handlePolarWebhook,
    // Add other Ingest functions here
]);