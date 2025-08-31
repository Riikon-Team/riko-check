import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import crypto from "crypto";
import ipaddr from "ipaddr.js";
import admin from "firebase-admin";
import rateLimit from "express-rate-limit";
import { getClientIp, ipInRanges } from "./utils";

const app = express();

