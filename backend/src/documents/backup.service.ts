import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { DocumentsService } from './documents.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupService {
    private readonly logger = new Logger(BackupService.name);

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private documentsService: DocumentsService,
    ) { }

    // Runs on the 1st of every month at midnight
    @Cron('0 0 1 * *')
    async handleMonthlyBackup() {
        this.logger.log('🔄 Starting monthly auto backup...');

        const users = await this.usersRepository.find({
            where: { autoBackup: true },
        });

        this.logger.log(`Found ${users.length} users with auto backup enabled`);

        for (const user of users) {
            try {
                await this.createBackupForUser(user.id, user.name);
                this.logger.log(`✅ Backup completed for user: ${user.name} (${user.id})`);
            } catch (error) {
                this.logger.error(`❌ Backup failed for user: ${user.name} (${user.id})`, error);
            }
        }

        // Clean up old backups (older than 3 months)
        this.cleanupOldBackups();

        this.logger.log('🎉 Monthly auto backup completed!');
    }

    async createBackupForUser(userId: string, userName: string) {
        const { archive, count } = await this.documentsService.backupDocuments(userId);

        if (count === 0) {
            this.logger.log(`⏭️ Skipping user ${userName} - no documents`);
            return;
        }

        // Ensure backup directory exists
        const backupDir = path.resolve(`./backups/${userId}`);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const date = new Date();
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const filename = `backup_${yearMonth}.zip`;
        const filePath = path.join(backupDir, filename);

        // Write archive to file
        return new Promise<void>((resolve, reject) => {
            const output = fs.createWriteStream(filePath);
            output.on('close', () => {
                this.logger.log(`📦 Saved: ${filePath} (${archive.pointer()} bytes)`);
                resolve();
            });
            output.on('error', reject);
            archive.pipe(output);
        });
    }

    private cleanupOldBackups() {
        const backupsDir = path.resolve('./backups');
        if (!fs.existsSync(backupsDir)) return;

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const userDirs = fs.readdirSync(backupsDir);
        for (const dir of userDirs) {
            const userDir = path.join(backupsDir, dir);
            if (!fs.statSync(userDir).isDirectory()) continue;

            const files = fs.readdirSync(userDir);
            for (const file of files) {
                const filePath = path.join(userDir, file);
                const stat = fs.statSync(filePath);
                if (stat.mtime < threeMonthsAgo) {
                    fs.unlinkSync(filePath);
                    this.logger.log(`🗑️ Deleted old backup: ${filePath}`);
                }
            }
        }
    }
}
