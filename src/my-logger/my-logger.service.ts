import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fspromises } from 'fs';
import * as path from 'path';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
    private logDirectory = path.join(__dirname, '..', '..', 'logs'); // Log directory
    private logFile = path.join(this.logDirectory, 'myLogFile.log'); // Log file


    private async ensureLogDirectoryExists(): Promise<void> {
        try {
            if (!fs.existsSync(this.logDirectory)) {
                await fspromises.mkdir(this.logDirectory, { recursive: true });
                console.log(`Log directory created: ${this.logDirectory}`);
            }
        } catch (e) {
            console.error('Failed to create log directory:', e instanceof Error ? e.message : e);
        }
    }

   
    private async logToFile(entry: string): Promise<void> {
        const formattedEntry = `${new Date().toISOString()}\t${entry}\n`;
        await this.ensureLogDirectoryExists(); // Ensure log directory exists

        try {
            await fspromises.appendFile(this.logFile, formattedEntry);
        } catch (e) {
            console.error('Failed to write log:', e instanceof Error ? e.message : e);
        }
    }

    async log(message: any, context?: string): Promise<void> {
        const entry = `${context ? `[${context}] ` : ''}${message}`;
        await this.logToFile(entry);
        super.log(message, context);
    }

    async error(message: any, trace?: string): Promise<void> {
        const entry = `Error: ${message} - Trace: ${trace || 'N/A'}`;
        await this.logToFile(entry); // Await logging to file
        super.error(message, trace); // Log error to console
    }

    async warn(message: any, context?: string): Promise<void> {
        const entry = `Warning: ${message}`;
        await this.logToFile(entry); 
        super.warn(message, context);
    }
}
